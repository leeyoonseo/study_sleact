import React, { useCallback, useEffect, useRef } from 'react'
import useSWR from 'swr';
import useSWRInfinite from "swr/infinite";
import gravatar from 'gravatar';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import ChatBox from '@components/ChatBox';
import { Container, Header } from './styles';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { IDM } from '@typings/db';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string, id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const scrollbarRef = useRef<Scrollbars>(null);
  const [chat, onChangeChat, setChat] = useInput('');
  const [socket] = useSocket(workspace);

  // useSWR -> useSWRInfinite 변경
  // const { data: chatData, mutate: mutateChat } = useSWR<IDM[]>(
  //   `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
  //   fetcher,
  // );
  // setSize: 페이지 수 바꿔주는 역할
  const { data: chatData, mutate: mutateChat, setSize } = useSWRInfinite<IDM[]>( 
    // useSWRInfinite 사용시 2차원 배열로 됨, 이걸 swr이 알아서 관리해주는 것임
    // [{ id: 1, id: 2, id: 3, id: 4 }] -> [[{ id: 1, id: 2 }]] -> [[{ id: 3, id: 4 }],[{ id: 1, id: 2 }]]

    // 함수로 바뀌고 index로 페이지 수 전달
    (index: number) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  // infinite scrolling할때 같이 구현하면 좋은 2개: 1. isEmpty (데이터 비어있다.), 2.isReachingEnd (더이상 가져올 데이터가 없다.)
  // isEmpty 예시: 40개 -> 20 + 20 + 0 이니 empty
  // isReachingEnd 예시: 45개 -> 20 + 20 + 5 이니 마지막 데이터가 20개가 안되니 다음에 데이터를 가져오지 않아도된다.   
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback((e: any) => {
    e.preventDefault();
    if (chat?.trim() && chatData) {
      // optimistic ui(낙관적 ui)일때 예시
      // then에서 스크롤 하단으로 보낼 시, 응답 지연에 따른 딜레이가 생길수있다.
      // 그럴 경우 미리 성공했다는 것을 보장하는 동작을 진행한다.
      // 임의로 데이터를 만들어서 넣어줘서 성공한 듯하게 만듬
      const savedChat = chat;
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData[0][0]?.id || 0) + 1,
          content: savedChat,
          SenderId: myData.id,
          Sender: myData,
          ReceiverId: userData.id,
          Receiver: userData,
          createdAt: new Date(),
        });
        return prevChatData;
      }, false).then(() => { // optimistic ui(낙관적 ui)일때는 shouldRevalidate를 false해줘야함
        setChat('');
        scrollbarRef.current?.scrollToBottom();
      });

      axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
        content: chat,
      })
      .then(() => {
        mutateChat();
      })
      .catch(console.error);
    }
  }, [chat, chatData, myData, userData, workspace, id]);

  const onMessage = useCallback((data: IDM) => {
    // id는 상대방 아이디 
    // 내 id가 아닌것만 mutateChat 진행: 왜? 내 id까지 할 경우 onSubmit과 중복이기 때문에, 2개의 데이터가 저장됨
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
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
  }, []);

  useEffect(() => {
    socket?.on('dm', onMessage);

    return () => {
      socket?.off('dm', onMessage);
    }
  }, [socket, onMessage]);

  // 로딩 시 스크롤바 제일 아래로
  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  if (!userData || !myData) {
    return null;
  }

  // reverse() 할 경우 불변성 유지 못함, reverse는 순서를 반대로
  // swr infinite를 사용하면서 1차원배열이 2차원배열로 되면서 타입에러가 발생, flat으로 해결 
  // const chatSections = makeSection(chatData ? [...chatData].reverse() : []);
  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);
  
  return (
    <Container>
      <Header>
        <img 
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} 
          alt={userData.nickname} 
        />
        <span>{userData.nickname}</span>
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
    </Container>
  )
}

export default DirectMessage;