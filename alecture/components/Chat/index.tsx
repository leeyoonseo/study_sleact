import React, { FC, memo, useMemo } from 'react'
import gravatar from 'gravatar';
import { IDM } from '@typings/db';
import { ChatWrapper } from './styles'
import dayjs from 'dayjs';
import regexifyString from 'regexify-string';
import { Link, useParams } from 'react-router-dom';

interface Props {
  data: IDM;
}

const Chat: FC<Props> = ({ data }) => {
  const { workspace } = useParams<{workspace: string }>();
  const user = data.Sender;
  const createdAt = dayjs(data.createdAt).format('h:mm A');

  // 정규표현식이 성능에 좋지는 않다.
  const result = useMemo(() => regexifyString({
    input: data.content,
    pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
    decorator(match, index) {
      // id 찾기
      const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;

      if (arr) {
        return (
          <Link 
            key={match + index} 
            to={`/workspace/${workspace}/dm/${arr[2]}`}
          >
            @{arr[1]}
          </Link>
        );
      }

      // 줄바꿈
      return <br key={index} />;
    } 
  }), [data.content]);
  // pattern:
  // g 모두 찾기
  // .+ 모든글자 한자리 이상 
  // \d+ 숫자 한자리 이상  ===> +는 최대한 많이? @[테스트123](5) 에서 '테스트123', +?는 최대한 조금? '테스트'
  // ? 는 0개나 1개, *이 0개 이상
  // | 또는
  // \n 줄바꿈 ===> /\n/g 줄바꿈 다 찾기
  // ()로 묶는건 그루핑 ===> 묶인 값이 arr[1], arr[2]...로 추가된다.

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
        <p>{result}</p>
      </div>
    </ChatWrapper>
  )
};

export default memo(Chat);