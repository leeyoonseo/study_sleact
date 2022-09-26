import useInput from '@hooks/useInput';
import React, { useCallback, ChangeEvent, SyntheticEvent, useState } from 'react';
// css module (css를 import해서 calssName과 연결)
// import 'styles.css';

// emotion (npm i @emotion/react @emotion/styled)
import { Form, Error, Label, Input, LinkContainer, Header, Button } from './styles';

const SignUp = () => {
  const [email, onChangeEmail, setEmail] = useInput<string>('');
  const [nickname, onChangeNickname, setNickname] = useInput<string>('');
  // 2번째 값은 일부로 커스텀 훅을 안사용하기 위해 비워둠
  const [password, , setPassword] = useInput<string>(''); 
  const [passwordCheck, , setPasswordCheck] = useInput<string>('');
  const [mismatchError, setMismatchError] = useState<boolean>(false);

  type InputElement = ChangeEvent<HTMLInputElement>;
  // const onChangeEmail = useCallback((e: React.FormEvent<HTMLInputElement>) => {
  // const onChangeEmail = useCallback((e: InputElement) => {
  //   // setEmail(e.target.value); // React.FormEvent 일때
  //   setEmail(e.target.value);
  // }, []);

  // const onChangeNickname = useCallback((e: InputElement) => {
  //   setNickname(e.target.value);
  // }, []);

  const onChangePassword = useCallback((e: InputElement) => {
    setPassword(e.target.value);
    setMismatchError(e.target.value !== passwordCheck);
  }, [passwordCheck]);

  const onChangePasswordCheck = useCallback((e: InputElement) => {
    setPasswordCheck(e.target.value);
    setMismatchError(e.target.value !== password);
  }, [password]);

  const onSubmit = useCallback((e: SyntheticEvent) => {
    e.preventDefault();

    if (!mismatchError) {
      console.log('서버로 회원가입하기')
    }
    console.log('email, nickname, password, passwordCheck :>> ', email, nickname, password, passwordCheck);
  }, [email, nickname, password, passwordCheck, mismatchError]);

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
          <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
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
        {/* {signUpError && <Error>{signUpError}</Error>}
        {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>} */}
      </Label>
      <Button type="submit">회원가입</Button>
    </Form>
    <LinkContainer>
      이미 회원이신가요?&nbsp;
      {/* <Link to="/login">로그인 하러가기</Link> */}
      <a href="/login">로그인 하러가기</a>
    </LinkContainer>
  </div>
  );
};

export default SignUp;