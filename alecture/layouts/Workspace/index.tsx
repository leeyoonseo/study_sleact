import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { MouseEvent, FC, useCallback, useState } from 'react';
import { Redirect, Route, Switch, useParams } from 'react-router';
import useSWR from 'swr';
// mutate 여기에 있는 것은 범용적으로 쓸 수 있는 mutate
// -> 이럴 경우 mutate('http://localhost:3095/api/users', false); 이렇게 써야함
// -> 전역 mutate가 유용한 이유? 컴포넌트 로딩될때마다 useSWR을 요청하게 되는데(1번), 이게 데이터 낭비라고 느껴지면 전역 mutate를 사용하는것
// import useSWR, { mutate } from 'swr';

import gravatar from 'gravatar';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import loadable from '@loadable/component';
import { IChannel, IUser } from '@typings/db';
import useInput from '@hooks/useInput';
import Modal from '@components/Modal';
import Menu from '@components/Menu';

import { AddButton, Channels, Chats, Header, LogOutButton, MenuScroll, ProfileImg, ProfileModal, RightMenu, WorkspaceButton, WorkspaceModal, WorkspaceName, Workspaces, WorkspaceWrapper } from './styles';
import { Button, Input, Label } from '@pages/SignUp/styles';
import 'react-toastify/dist/ReactToastify.css';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components/InviteChannelModal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: FC = () => {
  // swr들이 컴포넌트간의 전역 스토리지 역할
  // <IUser | false> -> 로그인이 안되면 false기 때문에
  const { workspace } = useParams<{workspace: string }>();
  const { data: userData, error, mutate } = useSWR<IUser | false>('/api/users', fetcher); 
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');
  
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

  const onClickUserProfile = useCallback(() => {
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []); 

  const onCloseUserProfile = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setShowUserMenu(false);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCreateWorkspace = useCallback((e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newWorkspace || !newWorkspace.trim()) return;
    if (!newUrl || !newUrl.trim()) return;
    if (!newWorkspace) return;

    axios.post('/api/workspaces', {
      workspace: newWorkspace,
      url: newUrl
    }, {
      withCredentials: true,
    })
    .then(() => {
      mutate(); // response.data, false);
      setShowCreateWorkspaceModal(false);
      setNewWorkspace('');
      setNewUrl('');
    })
    .catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, { position: 'bottom-center' });
    });
  }, [newWorkspace, newUrl]);

  // 화면에 떠있는 모든 모달을 닫는 메서드
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal(prev => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  if (!userData) {
    return <Redirect to="/login" />
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg 
              src={gravatar.url(userData.email, { s: '28px', d: 'retro' })} 
              alt={userData.nickname} 
            />
            {showUserMenu && (
              <Menu 
                style={{ right: 0, top: 38 }} 
                show={showUserMenu} 
                onCloseModal={onCloseUserProfile}
              >
                <ProfileModal>
                  <img 
                    src={gravatar.url(userData.email, { s: '36px', d: 'retro' })} 
                    alt={userData.nickname} 
                  />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>  
      </Header>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map(ws => {
            return (
              <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            )
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>
            Sleact
          </WorkspaceName>
          <MenuScroll>
            <Menu 
              show={showWorkspaceModal} 
              onCloseModal={toggleWorkspaceModal}
              style={{ top: 95, left: 80 }}
            >
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu> 
            <ChannelList />
            <DMList />
            { channelData?.map((v, i) => (
              <div key={i}>{v.name}</div>
            )) }
          </MenuScroll>
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
            <Route path="/workspace/:workspace/channel/:channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      {/* 컴포넌트2. children props 사용하는 방법 */}
      {/* {children} */}

      <Modal 
        show={showCreateWorkspaceModal} 
        onCloseModal={onCloseModal}
      >
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input 
              id="workspace" 
              value={newWorkspace}
              onChange={onChangeNewWorkspace}
            />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 이름</span>
            <Input 
              id="workspace" 
              value={newUrl}
              onChange={onChangeNewUrl}
            />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>

      <CreateChannelModal 
        show={showCreateChannelModal} 
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />

      <InviteWorkspaceModal
        show={showInviteWorkspaceModal} 
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />

      <InviteChannelModal
        show={showInviteChannelModal} 
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
      <ToastContainer />
    </div>
  )
};

export default Workspace;
// 그라바타 -> 아바타 랜덤 시스템 (이메일과 1:1 매칭?)
// npm i gravatar @types/gravatar