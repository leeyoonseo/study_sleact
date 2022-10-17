import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React, { FC, useCallback, useRef } from 'react'
import { ChatZone, Section } from './styles'
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  chatData?: IDM[];
}

const ChatList: FC<Props> = ({ chatData }: Props) => {
  const scrollbarRef = useRef(null);
  const onScroll = useCallback(() => {

  }, []);

  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollbarRef} onScrollFrame={onScroll}>
        {chatData?.map(chat => (
          <Chat key={chat.id} data={chat} />
        ))}
      </Scrollbars>
    </ChatZone>
  )
}

export default ChatList