import React, { useCallback, MouseEvent, KeyboardEvent } from 'react'
 import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useInput';
import { Container, Header } from './styles';

// type SubmitFormEvent = MouseEvent<HTMLFormElement> | KeyboardEvent<HTMLFormElement>;

const Channel = () => {
  const [chat, onChangeChat, setChat] = useInput('');
  const onSubmitForm = useCallback((e: any) => {
    e.preventDefault();
    setChat('');
  }, []);

  return (
    <Container>
      <Header>채널!</Header>
      <ChatList />
      <ChatBox 
        chat={chat} 
        onSubmitForm={onSubmitForm} 
        onChangeChat={onChangeChat} 
      />
    </Container>
  )
};

export default Channel;
