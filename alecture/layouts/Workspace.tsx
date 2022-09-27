import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { Redirect } from 'react-router';
import useSWR from 'swr';

const Workspace: FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // swr들이 컴포넌트간의 전역 스토리지 역할
  const { data, error, mutate } = useSWR('/api/users', fetcher); 
  const onLogout = useCallback(() => {
    axios.post('/api/users/logout', null, {
      withCredentials: true, // 쿠키 공유
    })
    .then(() => {
      mutate();
    })
  }, []);

  if (!data) {
    return <Redirect to="/login" />
  }

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  )
};

export default Workspace;