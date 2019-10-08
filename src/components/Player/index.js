var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from 'react';
import ReactPlayer from 'react-player';
import { Range, getTrackBackground } from 'react-range';
import { Duration } from '../Duration';
import * as analytics from '../../utils/analytics';
import './index.scss';
import { URL_APPLE_APP_STORE, URL_GOOGLE_PLAY_STORE, URL_PLAYPOST_WEBSITE } from '../../constants/urls';
import { getPlatform } from '../../utils/platform';
import { Button } from '../Button';
import { Modal, ModalContentAppStores } from '../Modal';
import * as Icons from '../Icons';
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            audiofileUrl: '',
            platform: '',
            isError: false,
            isLoading: false,
            isPlaying: false,
            isMuted: false,
            isSeeking: false,
            isReady: false,
            showAppStoresModal: false,
            showSettingsModal: false,
            volume: 1.0,
            duration: 0,
            playbackRate: 1.0,
            played: 0,
            playedSeconds: 0,
            loaded: 0,
            loadedSeconds: 0
        };
        _this.playerRef = React.createRef();
        _this.rangeMin = 0;
        _this.rangeMax = 1;
        _this.rangeStep = 0.0001;
        _this.appStoreRedirect = null;
        _this.handleOnClickPlayPause = function () {
            var _a = _this.state, isPlaying = _a.isPlaying, audiofileUrl = _a.audiofileUrl;
            var isLoading = !audiofileUrl && !_this.state.isLoading;
            if (isPlaying) {
                analytics.trackEvent('click_pause', _this.props.articleId);
            }
            else {
                analytics.trackEvent('click_play', _this.props.articleId);
            }
            _this.setState({ isPlaying: !isPlaying, isLoading: isLoading, audiofileUrl: _this.props.audiofileUrl });
        };
        _this.handleVolumeChange = function (e) {
            _this.setState({ volume: parseFloat(e.target.value) });
        };
        _this.handleToggleMuted = function () {
            var isMuted = _this.state.isMuted;
            _this.setState({ isMuted: !isMuted });
        };
        _this.handleSetPlaybackRate = function (e) {
            _this.setState({ playbackRate: parseFloat(e.target.value) });
        };
        _this.handleOnPlay = function () {
            console.log('handleOnPlay');
            _this.setState({ isPlaying: true, isLoading: false });
        };
        _this.handleOnPause = function () {
            console.log('handleOnPause');
            _this.setState({ isPlaying: false });
        };
        _this.handleRangeOnChange = function (value) {
            console.log('handleRangeOnChange', value);
            _this.setState({ played: value[0], isSeeking: true });
        };
        _this.handleRangeOnFinalChange = function (value) {
            _this.setState({ isSeeking: false });
            console.log('handleRangeOnFinalChange', value);
            if (_this.playerRef && _this.playerRef.current) {
                _this.playerRef.current.seekTo(value[0]);
            }
        };
        _this.handleOnProgress = function (progressState) {
            var isSeeking = _this.state.isSeeking;
            console.log('handleOnProgress', progressState);
            // We only want to update time slider if we are not currently isSeeking
            if (!isSeeking) {
                _this.setState(__assign(__assign({}, progressState), { isLoading: false }));
            }
        };
        _this.handleOnEnded = function () {
            console.log('handleOnEnded');
            _this.setState({ isPlaying: false });
        };
        _this.handleOnDuration = function (duration) {
            console.log('handleOnDuration', duration);
            _this.setState({ duration: duration });
        };
        _this.handleOnError = function (error, data) {
            _this.setState({ isLoading: false, isPlaying: false });
        };
        _this.handleOnSeek = function (seconds) {
            console.log('handleOnSeek', seconds);
        };
        _this.handleOnBuffer = function () {
            console.log('handleOnBuffer');
        };
        _this.handleOnStart = function () {
            console.log('handleOnStart');
        };
        _this.handleOnReady = function () {
            console.log('handleOnReady');
        };
        _this.handleOnClickTryAgain = function () {
            console.log('handleOnClickTryAgain');
            window.location.reload();
        };
        _this.handleOnClickSave = function () {
            var platform = _this.state.platform;
            var articleId = _this.props.articleId;
            window.location.href = "playpost://playlist/add/" + articleId;
            var appStoreUrl = platform === 'ios' ? URL_APPLE_APP_STORE : platform === 'android' ? URL_GOOGLE_PLAY_STORE : '';
            if (appStoreUrl) {
                analytics.trackEvent('click_save', _this.props.articleId, {
                    platform: platform,
                    appStoreUrl: appStoreUrl
                });
                _this.setState({ showAppStoresModal: true });
                _this.appStoreRedirect = window.setTimeout(function () {
                    window.location.href = URL_APPLE_APP_STORE;
                }, 1000);
            }
            else {
                analytics.trackEvent('click_save', _this.props.articleId, {
                    platform: platform
                });
                _this.setState({ showAppStoresModal: true });
            }
        };
        _this.handleOnClickCloseAppStoresModal = function () {
            _this.setState({ showAppStoresModal: false });
        };
        _this.handleOnClickCloseErrorModal = function () {
            _this.setState({ isError: false });
        };
        _this.handleOnClickToggleSettings = function () {
            var showSettingsModal = _this.state.showSettingsModal;
            _this.setState({ showSettingsModal: !showSettingsModal });
            console.log('handleOnClickToggleSettings');
        };
        return _this;
    }
    Player.prototype.componentDidMount = function () {
        var _a = this.props, audiofileLength = _a.audiofileLength, themeOptions = _a.themeOptions;
        var platform = getPlatform(navigator);
        this.setState({ duration: audiofileLength, platform: platform });
        console.log('Playpost Player Init: Using themeOptions: ', themeOptions);
        console.log('Playpost Player Init: Using duration: ', audiofileLength);
        console.log('Playpost Player Init: Using platform: ', platform);
    };
    Player.prototype.componentWillUnmount = function () {
        if (this.appStoreRedirect) {
            window.clearTimeout(this.appStoreRedirect);
            this.appStoreRedirect = null;
        }
    };
    Player.prototype.render = function () {
        var _this = this;
        var _a = this.state, isPlaying = _a.isPlaying, volume = _a.volume, isMuted = _a.isMuted, played = _a.played, duration = _a.duration, playbackRate = _a.playbackRate, audiofileUrl = _a.audiofileUrl, isLoading = _a.isLoading, isError = _a.isError, loaded = _a.loaded, showAppStoresModal = _a.showAppStoresModal, showSettingsModal = _a.showSettingsModal;
        var _b = this.props, articleTitle = _b.articleTitle, articleUrl = _b.articleUrl, voiceLabel = _b.voiceLabel, articleSourceName = _b.articleSourceName, themeOptions = _b.themeOptions, voiceLanguageCode = _b.voiceLanguageCode;
        var buttonThemeStyle = { backgroundColor: themeOptions.buttonColor };
        var playerContainerThemeStyle = { backgroundColor: themeOptions.backgroundColor, borderColor: themeOptions.borderColor };
        var titleThemeStyle = { color: themeOptions.titleColor };
        var trackThumbStyle = { backgroundColor: themeOptions.trackThumbColor };
        var trackLabelStyle = { backgroundColor: themeOptions.trackLabelBackgroundColor };
        return (React.createElement("div", { className: "Player" },
            isError && (React.createElement(Modal, { onClickClose: this.handleOnClickCloseErrorModal })),
            showAppStoresModal && (React.createElement(Modal, { onClickClose: this.handleOnClickCloseAppStoresModal },
                React.createElement(ModalContentAppStores, null))),
            showSettingsModal && (React.createElement(Modal, { onClickClose: this.handleOnClickToggleSettings },
                React.createElement("p", null, "Choose a voice"))),
            React.createElement("div", { className: "Player__container", style: playerContainerThemeStyle },
                React.createElement(ReactPlayer, { ref: this.playerRef, className: "Player__react-player", width: "100%", height: "100%", url: audiofileUrl, playing: isPlaying, controls: false, playbackRate: playbackRate, volume: volume, muted: isMuted, progressInterval: 1000, loop: false, config: {
                        file: {
                            forceAudio: true
                        }
                    }, onReady: this.handleOnReady, onStart: this.handleOnStart, onPlay: this.handleOnPlay, onPause: this.handleOnPause, onBuffer: this.handleOnBuffer, onSeek: this.handleOnSeek, onEnded: this.handleOnEnded, onError: this.handleOnError, onProgress: this.handleOnProgress, onDuration: this.handleOnDuration }),
                React.createElement("div", { className: "Player__top-container" },
                    React.createElement("div", { className: "Player__play-control-container" },
                        React.createElement("button", { type: "button", disabled: isLoading, className: "Player__play-control-button", onClick: this.handleOnClickPlayPause, style: buttonThemeStyle },
                            isLoading && React.createElement(Icons.Loading, null),
                            !isLoading && isPlaying ? React.createElement(Icons.Pause, null) : !isLoading ? React.createElement(Icons.Play, null) : '')),
                    React.createElement("div", { className: "Player__info-container" },
                        React.createElement("div", null,
                            React.createElement("h1", { className: "Player__title", style: titleThemeStyle },
                                React.createElement("a", { href: articleUrl, style: titleThemeStyle }, articleTitle)),
                            React.createElement("h2", { className: "Player__subtitle" },
                                React.createElement("a", { href: articleUrl }, articleSourceName),
                                ", voice: ",
                                voiceLabel,
                                " (",
                                voiceLanguageCode,
                                ")")),
                        React.createElement("div", { className: "Player__action" },
                            React.createElement(Button, { onClick: this.handleOnClickSave }, "Save to Playpost")))),
                React.createElement("div", { className: "Player__bottom-container" },
                    React.createElement("div", { className: "Player__progress-container" },
                        React.createElement("div", { className: "Player__progress-control-container" },
                            React.createElement(Range, { step: this.rangeStep, min: this.rangeMin, max: this.rangeMax, values: [played], onChange: this.handleRangeOnChange, onFinalChange: this.handleRangeOnFinalChange, renderTrack: function (_a) {
                                    var props = _a.props, children = _a.children;
                                    return (React.createElement("div", { onMouseDown: props.onMouseDown, onTouchStart: props.onTouchStart, className: "Player__range-track-container" },
                                        React.createElement("div", { ref: props.ref, style: __assign(__assign({}, props.style), { background: getTrackBackground({
                                                    values: [played, loaded],
                                                    colors: [themeOptions.trackBackgroundColor, '#AAAAAA', '#e5e5e5'],
                                                    min: _this.rangeMin,
                                                    max: _this.rangeMax
                                                }) }), className: "Player__range-track-inner" }, children)));
                                }, renderThumb: function (_a) {
                                    var props = _a.props, isDragged = _a.isDragged;
                                    return (React.createElement("div", __assign({}, props, { className: "Player__range-thumb-container" }),
                                        React.createElement("div", { className: "Player__range-thumb " + (isDragged ? 'Player__range-thumb--is-dragging' : ''), style: trackThumbStyle }),
                                        isDragged && (React.createElement("div", { className: "Player__range-thumb-label", style: trackLabelStyle },
                                            React.createElement(Duration, { seconds: duration * played })))));
                                } })),
                        React.createElement("div", { className: "Player__progress-time-container" },
                            React.createElement("div", { className: "Player__progress-time Player__progress-time--played " + (isPlaying ? 'is-playing' : '') },
                                React.createElement(Duration, { seconds: duration * played })),
                            React.createElement("a", { href: URL_PLAYPOST_WEBSITE, className: "Player__progress-time-branding", target: "_blank", rel: "noopener noreferrer" },
                                "Audio by ",
                                React.createElement("span", null, "Playpost")),
                            React.createElement("div", { className: "Player__progress-time Player__progress-time--remaining " + (isPlaying ? 'is-playing' : '') },
                                React.createElement(Duration, { seconds: duration * (1 - played) }))))))));
    };
    return Player;
}(React.PureComponent));
export { Player };
//# sourceMappingURL=index.js.map