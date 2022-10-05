import useInput, { ChangeInputEvent } from '@hooks/useInput';
import React, { useCallback, SyntheticEvent, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

// css module (css를 import해서 calssName과 연결)
// import 'styles.css';

// emotion (npm i @emotion/react @emotion/styled)
import { Form, Error, Label, Input, LinkContainer, Header, Button, Success } from './styles';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const SignUp = () => {
  const { data, error } = useSWR('/api/users', fetcher);
  const [email, onChangeEmail, setEmail] = useInput<string>('');
  const [nickname, onChangeNickname, setNickname] = useInput<string>('');
  // 2번째 값은 일부로 커스텀 훅을 안사용하기 위해 비워둠
  const [password, , setPassword] = useInput<string>(''); 
  const [passwordCheck, , setPasswordCheck] = useInput<string>('');
  const [mismatchError, setMismatchError] = useState<boolean>(false);
  const [signUpError, setSignUpError] = useState(''); 
  const [signUpSuccess, setSignUpSuccess] = useState(false); 

  const onChangePassword = useCallback((e: ChangeInputEvent) => {
    setPassword(e.target.value);
    setMismatchError(e.target.value !== passwordCheck);
  }, [passwordCheck]);

  const onChangePasswordCheck = useCallback((e: ChangeInputEvent) => {
    setPasswordCheck(e.target.value);
    setMismatchError(e.target.value !== password);
  }, [password]);

  const onSubmit = useCallback((e: SyntheticEvent) => {
    e.preventDefault();
    if (!mismatchError && nickname) {
      console.log('서버로 회원가입하기');
      // 비동기 요청 전 state는 비워주기
      setSignUpError('');

      // :3090 -> :3095
      // axios.post('http://localhost:3095/api/users', {
      // proxy설정 후 :3095 -> :3095 
      axios.post('/api/users', {
        email,
        nickname,
        password,
      }, {
        withCredentials: true
      })
      .then((response) => {
        console.log('response :>> ', response);
        setSignUpSuccess(true);
      })
      .catch((error: Error | AxiosError) => {
        if (axios.isAxiosError(error))  {
          setSignUpError(error.message);
        } else {
          setSignUpError(error.message);
        }
      })
      .finally(() => {});
    }
    console.log('onSubmit :>>', email, nickname, password, passwordCheck);
  }, [email, nickname, password, passwordCheck, mismatchError]);

  if (data === undefined) { 
    return <div>로딩중...</div>;
  }
  
  // return 문이 있을 경우 아무 위치나 둘 수 없다. 
  // -> 항상 hooks보다 아래에 존재해야 한다.
  // -> return으로 인해 오류가 날 수 있음.
  if (data) {
    return <Redirect to="/workspace/sleact/channel/일반" />;
  }

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
      <Label id="nickname-label">
        <span>닉네임</span>
        <div>
          <Input 
            type="text" 
            id="nickname" 
            name="nickname" 
            value={nickname} 
            onChange={onChangeNickname} 
          />
        </div>
      </Label>
      <Label id="password-label">
        <span>비밀번호</span>
        <div>
          <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
        </div>
      </Label>
      <Label id="password-check-label">
        <span>비밀번호 확인</span>
        <div>
          <Input
            type="password"
            id="password-check"
            name="password-check"
            value={passwordCheck}
            onChange={onChangePasswordCheck}
          />
        </div>
        {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
        {!nickname && <Error>닉네임을 입력해주세요.</Error>}
        {signUpError && <Error>{signUpError}</Error>}
        {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>}
      </Label>
      <Button type="submit">회원가입</Button>
    </Form>
    <LinkContainer>
      이미 회원이신가요?&nbsp;
      <Link to="/login">로그인 하러가기</Link>
    </LinkContainer>
  </div>
  );
};

export default SignUp;