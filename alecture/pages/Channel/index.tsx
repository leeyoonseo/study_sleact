import React, { DragEvent, useCallback, useEffect, useRef, useState } from 'react';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import InviteChannelModal from '@components/InviteChannelModal';
import useInput from '@hooks/useInput';
import useSocket from '@hooks/useSocket';
import { Container, DragOver, Header } from '@pages/Channel/styles';
import { IChannel, IChat, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import axios from 'axios';
import Scrollbars from 'react-custom-scrollbars';
import { useParams } from 'react-router';
import useSWR from 'swr';
import useSWRInfinite from "swr/infinite";

// 인터넷 환경에 따라서 상황(순서)이 달라질 수 있다. -> 때문에 서버에 저장된 후에 옳바른 순서를 노출해줘야한다. (검증 실패시 제거해야함)
// 0초 A: 안녕~(optimistic UI)
// 1초 B: 안녕~
// 2초 A: 안녕~(실제 서버)

const Channel = () => {
  const [dragOver, setDragOver] = useState(false);
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const scrollbarRef = useRef<Scrollbars>(null);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [socket] = useSocket(workspace);

  // useSWR -> useSWRInfinite 변경
  // const { data: chatData, mutate: mutateChat } = useSWR<IDM[]>(
  //   `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
  //   fetcher,
  // );
  // setSize: 페이지 수 바꿔주는 역할
  const { data: chatData, mutate: mutateChat, setSize } = useSWRInfinite<IChat[]>( 
    // useSWRInfinite 사용시 2차원 배열로 됨, 이걸 swr이 알아서 관리해주는 것임
    // [{ id: 1, id: 2, id: 3, id: 4 }] -> [[{ id: 1, id: 2 }]] -> [[{ id: 3, id: 4 }],[{ id: 1, id: 2 }]]

    // 함수로 바뀌고 index로 페이지 수 전달
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  const { data: channelMembersData } = useSWR<IUser[]>(
    myData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  // infinite scrolling할때 같이 구현하면 좋은 2개: 1. isEmpty (데이터 비어있다.), 2.isReachingEnd (더이상 가져올 데이터가 없다.)
  // isEmpty 예시: 40개 -> 20 + 20 + 0 이니 empty
  // isReachingEnd 예시: 45개 -> 20 + 20 + 5 이니 마지막 데이터가 20개가 안되니 다음에 데이터를 가져오지 않아도된다.   
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback((e: any) => {
    e.preventDefault();
    if (chat?.trim() && chatData && channelData) {
      // optimistic ui(낙관적 ui)일때 예시
      // then에서 스크롤 하단으로 보낼 시, 응답 지연에 따른 딜레이가 생길수있다.
      // 그럴 경우 미리 성공했다는 것을 보장하는 동작을 진행한다.
      // 임의로 데이터를 만들어서 넣어줘서 성공한 듯하게 만듬
      const savedChat = chat;
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData[0][0]?.id || 0) + 1,
          content: savedChat,
          UserId: myData.id,
          User: myData,
          ChannelId: channelData.id,
          Channel: channelData,
          createdAt: new Date(),
        });
        return prevChatData;
      }, false).then(() => { // optimistic ui(낙관적 ui)일때는 shouldRevalidate를 false해줘야함
        // 채팅을 쳤을 때도 시각을 업데이트
        // localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
        setChat('');
        scrollbarRef.current?.scrollToBottom();
      });

      axios.post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
        content: chat,
      })
      .then(() => {
        mutateChat();
      })
      .catch(console.error);
    }
  }, [chat, chatData, myData, workspace, channel]);

  const onMessage = useCallback((data: IChat) => {
    // id는 상대방 아이디 
    // 내 id가 아닌것만 mutateChat 진행: 왜? 내 id까지 할 경우 onSubmit과 중복이기 때문에, 2개의 데이터가 저장됨
    if (
      data.Channel.name === channel && 
      (data.content.startsWith('uploads\\') || data.UserId !== myData?.id) // 이미지 업로드는 optimistic ui가 아니기 때문에 조건이 추가되어야함
    ) {
      // socket.io가 서버로부터 실시간으로 데이터를 가져오는데,
      // 그것을 다시 서버에 요청할 이유는 없다. ===> revalidate할 필요없다 (난 어차피 안썼다.)
      mutateChat((chatData) => {
        // 가장 최신 데이터 삽입
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        // 스크롤바 조정 
        // 남이 보내는 채팅일 경우 스크롤바가 내려가지 않도록 150px로 기준을 잡았다. (150px보다 위에 스크롤을 올렸을 경우, 내 채팅 스크롤에 영향을 주지 않는다.)
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 50);
          }
        }
      });
    }
  }, [channel, myData]);

  useEffect(() => {
    socket?.on('message', onMessage);

    return () => {
      socket?.off('message', onMessage);
    }
  }, [socket, onMessage]);

  // 페이지가 로딩될때, 현재 시간을 기록함. (localStorage에 저장)
  // 채널 입장 시 현재 시각이 기록되며, 채팅을 읽은 기록
  // 채팅창 입장 시간 기록 -> 채팅 입력 -> 다시 기록 (왜? 채팅 쳤을때 내 시각을 기록하지 않으면, 내가 작성한 채팅마저 읽지 않은 형식이 됨)
  // useEffect(() => {
  //   localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  // }, [workspace, channel]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, []);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, []);

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // 서버로 파일을 보낼때, formdata를 많이 사용
    const formData = new FormData();

    // 참조: mdn
    if (e.dataTransfer.items) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        if (e.dataTransfer.items[i].kind === 'file') {
          const file = e.dataTransfer.items[i].getAsFile();
          console.log(e, '.... file[' + i + '].name = ' + file?.name);
          formData.append('image', file!);
        }
      }
    } else {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        console.log(e, '... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
        formData.append('image', e.dataTransfer.files[i]);
      }
    }

    axios.post(
      `/api/workspaces/${workspace}/channels/${channel}/images`, 
      formData
    ).then(() => {
      setDragOver(false);
    });
  }, [workspace, channel]);

  const onDragOver= useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log(e);
    setDragOver(true);
  }, []);


  if (!myData) {
    return null;
  }

  // reverse() 할 경우 불변성 유지 못함, reverse는 순서를 반대로
  // swr infinite를 사용하면서 1차원배열이 2차원배열로 되면서 타입에러가 발생, flat으로 해결 
  // const chatSections = makeSection(chatData ? [...chatData].reverse() : []);
  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);
  
  return (
    <Container 
      onDrop={onDrop} 
      onDragOver={onDragOver}
    >
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button 
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" area-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList 
        ref={scrollbarRef}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
        chatSections={chatSections} 
      />
      <ChatBox 
        chat={chat} 
        onSubmitForm={onSubmitForm} 
        onChangeChat={onChangeChat} 
      />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
      {dragOver && <DragOver>업로드!</DragOver>}

    </Container>
  )
}

export default Channel;