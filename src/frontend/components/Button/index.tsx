import React from 'react';

import './style.scss'

interface Props {
  type?: 'clean';
  onClick(): void;
}

export const Button: React.FC<Props> = ({ children, type, onClick, ...restProps }) => (
  <button
    {...restProps}
    type="button"
    className={`Button ${(type === 'clean') ? 'Button--clean' : null}`}
    onClick={onClick}
  >
    {children}
  </button>
)
