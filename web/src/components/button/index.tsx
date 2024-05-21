import cx from 'classnames';
import styles from './index.module.scss';

import type { PropsWithChildren, FC, ReactNode } from 'react';

interface Props {
  content: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'primary' | 'secondary';
}

const Button: FC<PropsWithChildren<Props>> = ({
  className,
  content,
  onClick,
  type
}) => {
  return (
    <button
      className={cx(className, styles.button, {
        [styles.primary]: type === 'primary'
      })}
      onClick={onClick}
    >
      {content}
    </button>
  );
};

export default Button;
