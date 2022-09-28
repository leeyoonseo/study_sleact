import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import useSWR from 'swr';
// mutate 여기에 있는 것은 범용적으로 쓸 수 있는 mutate
// -> 이럴 경우 mutate('http://localhost:3095/api/users', false); 이렇게 써야함
// -> 전역 mutate가 유용한 이유? 컴포넌트 로딩될때마다 useSWR을 요청하게 되는데(1번), 이게 데이터 낭비라고 느껴지면 전역 mutate를 사용하는것
// import useSWR, { mutate } from 'swr';

import gravatar from 'gravatar';
import { Channels, Chats, Header, MenuScroll, ProfileImg, RightMenu, WorkspaceName, Workspaces, WorkspaceWrapper } from './styles';
import loadable from '@loadable/component';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // swr들이 컴포넌트간의 전역 스토리지 역할
  const { data, error, mutate } = useSWR('/api/users', fetcher); 
  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', null, {
      withCredentials: true, // 쿠키 공유
    })
    .then((response) => {
      // shouldRevalidate가 false여야 서버에 요청을 안보냄 (점검을 하기 위해 요청을 1번함, 이것조차 안하려면 false)
      // -> 왜? 서버에 요청이 된지 안된지도 모르지만 저장하는 행동이 위험하기에 
      // optimistic ui (true할 경우)-> 낙관적 ui (내가 보낸 요청이 성공할 것이라고 낙관하는것 -> 이런경우 예시: 인스타그램 하트를 누를경우 바로 하트가 활성화됨 (실패할 경우 하트 비활성화하는 형식으로 함))
      // -> 때문에 점검하는 동작이 true로 되어있는 것임..
      // 기본적으로 두지 않으면 pessimistic ui (서버 성공 후 ui 변경)
      // false면 걍 서버요청안하고 로컬 데이터 수정
      mutate(response.data, false);
    })
  }, []);

  if (!data) {
    return <Redirect to="/login" />
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span>
            <ProfileImg 
              src={gravatar.url(data.email, { s: '28px', d: 'retro' })} 
              alt={data.nickname} 
            />
          </span>
        </RightMenu>  
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspaces>test</Workspaces>
        <Channels>
          <WorkspaceName>Sleact</WorkspaceName>
          <MenuScroll>MenuScroll</MenuScroll>
        </Channels>
        <Chats>
          {/* 
            컴포넌트3. 워크스페이스 안에서 라우터 
            switch > switch할때 path에 대한 구조가 똑같아야함.
            즉, app/index.tsx에서 path="/workspace"일 경우 하위는 계층 구조를 가져야함 (중첩 라우터)
            -> path="/workspace/channel" 이나 path="/workspace/dm" (O)
            -> path="/ws/channel"(X)
          */}
          <Switch>
            <Route path="/workspace/channel" component={Channel} />
            <Route path="/workspace/dm" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      {/* 컴포넌트2. children props 사용하는 방법 */}
      {children}
    </div>
  )
};

export default Workspace;

// 그라바타 -> 아바타 랜덤 시스템 (이메일과 1:1 매칭?)
// npm i gravatar @types/gravatar