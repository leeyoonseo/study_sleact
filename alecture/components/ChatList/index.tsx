import Chat from '@components/Chat';
import { IDM } from '@typings/db';
import React, { useCallback, forwardRef } from 'react'
import { ChatZone, Section, StickyHeader } from './styles'
import { Scrollbars } from 'react-custom-scrollbars';

interface Props {
  chatSections: { [key: string]: IDM[] };
  setSize: (f: (size: number) => number) => Promise<IDM[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
}

// forwardRef 사용하지 않고 그냥 Props로 전달받아도 사용할 수는 있다.
// const ChatList: FC<Props> = ({ chatSections, ref }: Props) => {
// forwardRef 사용 예시
const ChatList = forwardRef<Scrollbars, Props>(({ 
  chatSections, 
  setSize, 
  isEmpty, 
  isReachingEnd 
}, ref) => {
  // 상위로 옮기기, forwardRef 사용
  // const scrollbarRef = useRef(null);
  const onScroll = useCallback((values: any) => {
    if (values.scrollTop === 0 && !isReachingEnd) {
      console.log('가장 위');
      setSize((prevSize) => prevSize + 1).then(() => {
                
      });
    }
  }, []);

  return (
    <ChatZone>
      <Scrollbars autoHide ref={ref} onScrollFrame={onScroll}>
        {Object.entries(chatSections)?.map(([date, chats]) => {
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          )
        })}
      </Scrollbars>
    </ChatZone>
  )
});

export default ChatList