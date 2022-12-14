import React, { CSSProperties, FC, useCallback, MouseEvent } from 'react'
import { CloseModalButton, CreateMenu } from './styles'

interface Props {
  show: boolean;
  onCloseModal: (e: any) => void;
  style: CSSProperties;
  closeButton?: boolean;
}
const Menu: FC<React.PropsWithChildren<Props>> = ({ 
  children,
  style,
  show,
  onCloseModal,
  closeButton
}) => {
  const stopPropagation = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  if (!show) return null;

  return (
    <CreateMenu onClick={onCloseModal}>
      <div style={style} onClick={stopPropagation}>
        {closeButton && (
          <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
        )}
          {children}
      </div>
    </CreateMenu>
  )
};

Menu.defaultProps = {
  closeButton: true,
};

export default Menu;