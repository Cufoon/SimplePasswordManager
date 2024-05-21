import Button from '$components/button';
import styles from './index.module.scss';

import { PropsWithChildren, FC } from 'react';

interface Props {
  visible: boolean;
  changeVisible: (visible: boolean) => void;
  className?: string;
  title?: string;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

const Modal: FC<PropsWithChildren<Props>> = ({
  visible,
  changeVisible,
  children,
  title,
  okText,
  cancelText,
  onCancel,
  onOk
}) => {
  return (
    visible && (
      <div
        className={styles.wrapper}
        onClick={() => {
          changeVisible(false);
        }}
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          {title && <div className={styles.modalTitle}>{title}</div>}
          <div>{children}</div>
          <div className={styles.modalOperate}>
            <Button
              type='primary'
              content={cancelText || '取消'}
              onClick={onCancel}
            />
            <Button type='primary' content={okText || '确认'} onClick={onOk} />
          </div>
        </div>
      </div>
    )
  );
};

export default Modal;
