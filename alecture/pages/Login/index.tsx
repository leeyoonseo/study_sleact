import useInput from '@hooks/useInput';
import { Success, Form, Error, Label, Input, LinkContainer, Button, Header } from '@pages/SignUp/styles';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';

// swr이나 react-query나 둘중 아무거나 사용해도 무방
import useSWR from 'swr';

const LogIn = () => {
  // data가 존재하지 않으면 loading 중임... swr은 로딩중인것을 알 수 있음
  const { data, error, mutate } = useSWR('/api/users', fetcher, {
    dedupingInterval: 100000, // default는 2초
    // 주기적으로 호출되지만, 기간내에는 캐시에서 가져온다. 

    // etc....
    // focusThrottleInterval: 3000 // revalidate 제한
    // errorRetryInterval: 5000 // 에러가 나도 스스로 재요청을 보내는 간격
    // errorRetryCount: // 최대 몇번까지 요청할지
    // loadingTimeout: 3000 // 어떤 요청 후 3초가 걸리면 알려주기위해 사용
  }); 
  // 주소, fetcher 함수 (이 주소를 어떻게 처리할지 정해주는 함수 -> swr은 아무역할을 안함. 주소를 fetcher로 옮겨주는 역할만함)
  const [logInError, setLogInError] = useState(false);
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const onSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      setLogInError(false);
      axios
        .post(
          '/api/users/login',
          { email, password },
          {
            // back, front 서버 주소가 다르면(도메인이 다르면) cookie 전달이 안되는 문제 발생
            // -> withCredentials: true로 설정하기
            // -> 쿠키는 보통 서버가 만들고, 프론트는 저장하거나 요청이 필요할때 사용한다.
            withCredentials: true,
          },
        )
        .then(() => {
          mutate(); // fetcher 실행을 조작
        })
        .catch((error) => {
          // setLogInError(error.response?.data?.statusCode === 401);
        });
    },
    [email, password],
  );

  // if (data === undefined) {
  //   return <div>로딩중...</div>;
  // }

  // if (data) {
  //   return <Redirect to="/workspace/sleact/channel/일반" />;
  // }

  // console.log(error, userData);
  // if (!error && userData) {
  //   console.log('로그인됨', userData);
  //   return <Redirect to="/workspace/sleact/channel/일반" />;
  // }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="password-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {logInError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;