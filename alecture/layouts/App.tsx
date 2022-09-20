import React, { FC } from 'react';
import { Switch, Router, Route, Redirect } from 'react-router-dom';
import LogIn from '@pages/Login';
import SignUp from '@pages/SignUp';

const App: FC = () => {
  return (
    // Switch: 여러개 라우터 중 하나만
    <Switch>
      <Redirect exact path="/" to="/login" />
        <Route path="/login" component={LogIn} />
        <Route path="/signup" component={SignUp} />
    </Switch>
  );
};

export default App;