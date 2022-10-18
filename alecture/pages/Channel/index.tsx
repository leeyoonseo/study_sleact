import React, { useCallback, useRef } from 'react'
 import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { Container, Header } from './styles';
import makeSection from '@utils/makeSection';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import useSWRInfinite from "swr/infinite";
import { IDM } from '@typings/db';
import Scrollbars from 'react-custom-scrollbars';

const Channel = ({ }) => {
  const { workspace, id } = useParams<{ workspace: string, id: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const scrollbarRef = useRef<Scrollbars>(null);
  const { data: chatData, setSize } = useSWRInfinite<IDM[]>(
    (index: number) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );

  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback((e: any) => {
    e.preventDefault();
    setChat('');
  }, []);

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  return (
    <Container>
      <Header>채널!</Header>
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
};

export default Channel;