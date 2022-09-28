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
        <Route path="/workspace" component={Workspace} />
    </Switch>
  );
};

export default App;