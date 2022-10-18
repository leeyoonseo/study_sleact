import React, { useCallback } from 'react'
 import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { Container, Header } from './styles';
import makeSection from '@utils/makeSection';
import { useParams } from 'react-router';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import { IDM } from '@typings/db';

const Channel = () => {
  const { workspace, id } = useParams<{ workspace: string, id: string }>();
  const [chat, onChangeChat, setChat] = useInput('');
  const { data: chatData } = useSWR<IDM[]>(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
  );
  const onSubmitForm = useCallback((e: any) => {
    e.preventDefault();
    setChat('');
  }, []);

  const chatSections = makeSection(chatData ? [...chatData].reverse() : []);

  return (
    <Container>
      <Header>채널!</Header>
      <ChatList chatSections={chatSections} />
      <ChatList chatSections={chatSections} />

      <ChatBox 
        chat={chat} 
        onSubmitForm={onSubmitForm} 
        onChangeChat={onChangeChat} 
      />
    </Container>
  )
};

export default Channel;
