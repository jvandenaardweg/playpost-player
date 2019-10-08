import React from 'react';
import { URL_APPLE_APP_STORE, URL_GOOGLE_PLAY_STORE, URL_PLAYPOST_WEBSITE } from '../../constants/urls';
import * as Icons from '../Icons';
import './style.scss';
export var Modal = function (_a) {
    var title = _a.title, text = _a.text, onClickTryAgain = _a.onClickTryAgain, onClickClose = _a.onClickClose, children = _a.children;
    return (React.createElement("div", { className: "Modal" },
        React.createElement("div", { className: "Modal__content" },
            React.createElement("button", { type: "button", className: "Modal__button-close", onClick: onClickClose },
                React.createElement(Icons.Close, null)),
            children)));
};
export var ModalContentAppStores = function () { return (React.createElement("div", null,
    React.createElement("p", null,
        "Save directly to your playlist in ",
        React.createElement("a", { href: URL_PLAYPOST_WEBSITE }, "Playpost")),
    React.createElement("div", { className: "Modal__columns--2" },
        React.createElement("a", { href: URL_APPLE_APP_STORE },
            React.createElement(Icons.AppleAppStore, null)),
        React.createElement("a", { href: URL_GOOGLE_PLAY_STORE },
            React.createElement(Icons.GooglePlayStore, null))))); };
//# sourceMappingURL=index.js.map