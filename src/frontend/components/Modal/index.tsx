import React from 'react';
import { URL_APPLE_APP_STORE, URL_GOOGLE_PLAY_STORE, URL_PLAYPOST_WEBSITE } from '../../constants/urls';
import * as Icons from '../Icons';

import './style.scss';

interface Props {
  title?: string;
  text?: string;
  onClickTryAgain?(): void;
  onClickClose(): void;
}


export const Modal: React.FC<Props> = ({ title, text, onClickTryAgain, onClickClose, children }) => (
  <div className="Modal">
    <div className="Modal__content">
      <button type="button" className="Modal__button-close" onClick={onClickClose}>
        <Icons.Close />
      </button>
      {children}
    </div>
  </div>
)

export const ModalContentAppStores = () => (
  <div className="Modal__appstores">
    <p><strong>Add to your playlist in <a href={URL_PLAYPOST_WEBSITE} target="_blank" rel="noopener noreferrer">Playpost</a></strong></p>
    <div className="Modal__columns--2">
      <a href={URL_APPLE_APP_STORE} target="_blank" rel="noopener noreferrer"><Icons.AppleAppStore /></a>
      <a href={URL_GOOGLE_PLAY_STORE} target="_blank" rel="noopener noreferrer"><Icons.GooglePlayStore /></a>
    </div>
  </div>
)
