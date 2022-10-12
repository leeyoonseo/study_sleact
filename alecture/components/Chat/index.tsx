import React, { FC } from 'react'
import gravatar from 'gravatar';
import { IDM } from '@typings/db';
import { ChatWrapper } from './styles'

interface Props {
  data: IDM;
}

const Chat: FC<Props> = ({ data }: Props) => {
  const user = data.Sender;

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{String(data.createdAt)}</span>
        </div>
        <p>{data.content}</p>
      </div>
    </ChatWrapper>
  )
}

export default Chat