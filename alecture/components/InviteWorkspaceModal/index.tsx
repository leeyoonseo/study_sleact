import Modal from '@components/Modal'
import useInput from '@hooks/useInput';
import React, { FC, FormEvent, useCallback } from 'react'
import { Button, Input, Label } from '@pages/SignUp/styles';
import axios from 'axios';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import { IChannel, IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteWorkspaceModal: (flag: boolean) => void;
};

interface Params {
  workspace: string;
  channel: string;
}

const inviteWorkspaceModal: FC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  // parameter자리 (/:workspace)에서 useParams로 가져다 쓸 수 있다.
  const { workspace } = useParams<Params>(); 
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { mutate } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/members` : null, 
    fetcher,
  );

  const onInviteMember = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMember || !newMember.trim()) {
      return;
    }

    axios.post(`/api/workspaces/${workspace}/members`, {
      email: newMember,
    }, {
      withCredentials: true,
    })
    .then(() => {
      setShowInviteWorkspaceModal(false);
      mutate();
      setNewMember('');
    })
    .catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, { position: 'bottom-center' });
    });
  }, [workspace, newMember]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>이메일</span>
          <Input 
            type="email"
            id="member" 
            value={newMember}
            onChange={onChangeNewMember}
          />
        </Label>
        <Button type="submit">초대하기</Button>
      </form>
    </Modal>
  )
};

export default inviteWorkspaceModal;