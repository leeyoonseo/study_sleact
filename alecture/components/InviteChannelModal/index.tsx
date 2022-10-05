import axios from 'axios';
import useSWR from 'swr';
import React, { FC, FormEvent, useCallback } from 'react'
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import Modal from '@components/Modal'
import useInput from '@hooks/useInput';
import fetcher from '@utils/fetcher';
import { IUser } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
};

interface Params {
  workspace: string;
  channel: string;
}

const InviteChannelModal: FC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const [newMember, onChangeNewMember, setNewMember] = useInput('');
  // parameter자리 (/:workspace)에서 useParams로 가져다 쓸 수 있다.
  const { workspace, channel } = useParams<Params>(); 
  const { data: userData } = useSWR<IUser>('/api/users', fetcher);
  const { mutate } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null, 
    fetcher,
  );

  const onInviteMember = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMember || !newMember.trim()) {
      return;
    }

    axios.post(`http://localhost:3095/api/workspaces/${workspace}/channels/${channel}/members`, {
      email: newMember,
    }, {
      withCredentials: true,
    })
    .then((response) => {
      setShowInviteChannelModal(false);
      mutate(response.data, false);
      setNewMember('');
    })
    .catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, { position: 'bottom-center' });
    });
  }, [newMember]);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>채널 멤버 초대</span>
          <Input 
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

export default InviteChannelModal;