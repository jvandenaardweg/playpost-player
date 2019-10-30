import React from 'react';

import './style.scss'

interface Props {
  type?: 'clean';
  onClick(): void;
  href?: string;
  target?: string;
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

export const ButtonLink: React.FC<Props> = ({ children, type, href, ...restProps }) => (
  <a
    {...restProps}
    className={`Button ${(type === 'clean') ? 'Button--clean' : null}`}
    href={href}
  >
    {children}
  </a>
)
