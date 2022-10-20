import { IChat, IDM } from '@typings/db';
import dayjs from 'dayjs';

interface Sections {
  [key: string ]: (IDM | IChat)[];
}

export default function makeSection(chatList: (IDM | IChat)[]) {
  const sections: Sections = {};

  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD');

    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      sections[monthDate] = [chat];
    }
  });

  return sections;
}