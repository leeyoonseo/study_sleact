import React, { FC } from 'react'
import gravatar from 'gravatar';
import { IDM } from '@typings/db';
import { ChatWrapper } from './styles'
import dayjs from 'dayjs';

interface Props {
  data: IDM;
}

const Chat: FC<Props> = ({ data }) => {
  const user = data.Sender;
  const createdAt = dayjs(data.createdAt).format('h:mm A');

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>&nbsp;
          <span>{createdAt}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  )
}

export default Chat