import React, { useCallback, useRef } from 'react'
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

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string, id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const scrollbarRef = useRef<Scrollbars>(null);
  const [chat, onChangeChat, setChat] = useInput('');
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
    console.log('submit', 'chat:', chat);
    if (chat?.trim()) {
      axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
        content: chat,
      })
      .then(() => {
        mutateChat();
        setChat('');
      })
      .catch(console.error);
    }
  }, [chat]);

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
        isEmpty={isEmpty}
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