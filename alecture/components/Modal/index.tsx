import React, { FC, useCallback, MouseEvent } from 'react'
import { CloseModalButton, CreateModal } from './styles';

interface Props {
  show: boolean;
  onCloseModal: () => void;
}

const Modal: FC<React.PropsWithChildren<Props>>  = ({
  children,
  show,
  onCloseModal,
}) => {
  const stopPropagation = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  if(!show) {
    return null;
  }

  return (
    <CreateModal onClick={onCloseModal}>
      <div onClick={stopPropagation}>
        <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        {children}
      </div>
    </CreateModal>
  )
};

export default Modal;