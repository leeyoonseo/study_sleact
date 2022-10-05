import React, { FC } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import loadable from '@loadable/component';

// 코드스플리팅 하기 => npm i @loadable/component
// - 페이지 단위, 지금 렌더링 안되도 되는 것
// - 서버사이드 렌더링 안되도 되는 것
// !!! 페이지들은 코드 스플리팅 고려할 것
const LogIn = loadable(() => import('@pages/Login'));
const SignUp = loadable(() => import('@pages/SignUp'));
const Workspace = loadable(() => import('@layouts/Workspace'));
// Workspace에서 코드스플리팅 및 라우터 진행
// const Channel = loadable(() => import('@pages/Channel'));
// const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const App: FC = () => {
  return (
    // Switch: 여러개 라우터 중 하나만
    <Switch>
      <Redirect exact path="/" to="/login" />
        <Route path="/login" component={LogIn} />
        <Route path="/signup" component={SignUp} />
        {/* main router를 가져오고 workspace 내에서 또 route를 통해 페이지 구분 */}
        <Route path="/workspace/:workspace" component={Workspace} />

        {/*
          파라미터와 아닌 path가 있을때, 반드시 일반 path를 가진 Route가 위에 와야한다.  
          위에서 부터 아래로 실행되기 때문에 sleact가 하위에 있을 경우 접근이 안된다.
          -> 무조건 :workspace가 가져가기 때문
        */}
        {/* <Route path="/workspace/sleact" component={Workspace} /> */}
        {/* 라우트 파라미터 /:workspace/ -> 다이나믹라우트 */}
        {/* <Route path="/workspace/:workspace" component={Workspace} />  */}
        
    </Switch>
  );
};

export default App;