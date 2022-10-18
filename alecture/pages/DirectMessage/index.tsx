import React, { useCallback } from 'react'
import useSWR from 'swr';
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


const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string, id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR('/api/users', fetcher);
  const [chat, onChangeChat, setChat] = useInput('');
  const { data: chatData, mutate: mutateChat } = useSWR<IDM[]>(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
  );

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
  const chatSections = makeSection(chatData ? [...chatData].reverse() : []);
  
  return (
    <Container>
      <Header>
        <img 
          src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} 
          alt={userData.nickname} 
        />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList chatSections={chatSections} />
      <ChatBox 
        chat={chat} 
        onSubmitForm={onSubmitForm} 
        onChangeChat={onChangeChat} 
      />
    </Container>
  )
}

export default DirectMessage;