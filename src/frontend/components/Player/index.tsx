import React from 'react'
import ReactPlayer from 'react-player';
import playerjs from 'player.js';

import { version } from '../../../../package.json';

import * as analytics from '../../utils/analytics'

import './index.scss'

import { URL_APPLE_APP_STORE, URL_GOOGLE_PLAY_STORE, URL_PLAYPOST_WEBSITE } from '../../constants/urls';
import { getPlatform } from '../../utils/platform';
import { Button } from '../Button';
import { Modal, ModalContentAppStores } from '../Modal';
import * as Icons from '../Icons';
import { ProgressControl } from '../ProgressControl';

export enum PlayerType {
  small = 'small',
  normal = 'normal',
  large = 'large'
}

export interface PlayerThemeOptions {
  buttonColor: string;
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  trackBackgroundColor: string;
  trackThumbColor: string;
  trackLabelBackgroundColor: string;
}

export interface PlayerOptions {
  hideTitle: boolean;
  hidePlaylistButton: boolean;
}

interface Props {
  audiofileUrl: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  articleSourceName: string;
  voiceLabel: string;
  voiceLanguageCode: string;
  audiofileLength: number;
  themeOptions: PlayerThemeOptions;
  playerOptions: PlayerOptions;
  type: PlayerType;
}

interface State {
  audiofileUrl: string;
  platform: string;
  isError: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isSeeking: boolean;
  isReady: boolean;
  isLooped: boolean;
  showAppStoresModal: boolean;
  showSettingsModal: boolean;
  volume: number;
  duration: number;
  playbackRate: number;
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number
}

export class Player extends React.PureComponent<Props, State> {
  state = {
    audiofileUrl: '',
    platform: '',
    isError: false,
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    isSeeking: false,
    isReady: false,
    isLooped: false,
    showAppStoresModal: false,
    showSettingsModal: false,
    volume: 1.0,
    duration: 0,
    playbackRate: 1.0,
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0
  }

  private playerRef = React.createRef<ReactPlayer>()
  private rangeMin = 0;
  private rangeMax = 1;
  private rangeStep = 0.0001;

  private appStoreRedirect: number | null = null;
  private playerjsReceiver = new playerjs.Receiver();

  componentDidMount() {
    const { audiofileLength, themeOptions, type } = this.props
    const platform = getPlatform(window.navigator)

    this.setState({ duration: audiofileLength, platform })

    console.log('Playpost Player Init: Version: ', version)
    console.log('Playpost Player Init: Using themeOptions: ', themeOptions)
    console.log('Playpost Player Init: Using duration: ', audiofileLength)
    console.log('Playpost Player Init: Using platform: ', platform)
    console.log('Playpost Player Init: Type: ', type)

    this.setupPlayerJSInteractions()
  }

  componentWillUnmount() {
    if (this.appStoreRedirect) {
      window.clearTimeout(this.appStoreRedirect)
      this.appStoreRedirect = null
    }
  }

  /**
   * Setup our Player to work through Embed.ly
   */
  setupPlayerJSInteractions = () => {
    // TEST AT: http://playerjs.io/test.html
    // You can use the localhost url in the test

    this.playerjsReceiver.on('play', () => {
      this.playAudio()
      this.playerjsReceiver.emit('play');
    });

    this.playerjsReceiver.on('pause', () => {
      this.pauseAudio();
      this.playerjsReceiver.emit('pause');
    });

    this.playerjsReceiver.on('mute', () => {
      this.muteAudio();
      this.playerjsReceiver.emit('mute');
    });

    this.playerjsReceiver.on('unmute', () => {
      this.unmuteAudio();
      this.playerjsReceiver.emit('unmute');
    });

    this.playerjsReceiver.on('setVolume', (value: number) => {
      this.setState({ volume: value / 100 })
    });

    this.playerjsReceiver.on('setCurrentTime', (value: number) => {
      this.playerRef.current && this.playerRef.current.seekTo(value)
    });

    this.playerjsReceiver.on('getCurrentTime', (callback: any) => {
      return callback(Math.floor(this.state.playedSeconds))
    });

    this.playerjsReceiver.on('getPaused', (callback: any) => {
      const isPaused = !this.state.isPlaying
      return callback(isPaused)
    });

    this.playerjsReceiver.on('getDuration', (callback: any) => {
      return callback(this.state.duration)
    });

    this.playerjsReceiver.on('getVolume', (callback: any) => {
      console.log(this.state.volume * 100)
      return callback(this.state.volume * 100)
    });

    this.playerjsReceiver.on('getMuted', (callback: any) => {
      return callback(this.state.isMuted)
    });

    this.playerjsReceiver.on('getLoop', (callback: any) => {
      return callback(this.state.isLooped)
    });

    this.playerjsReceiver.on('setLoop', (value: boolean) => {
      this.setState({ isLooped: value })
    });

    this.playerjsReceiver.ready();
  }

  playAudio = () => {
    const { audiofileUrl } = this.state
    const { articleId } = this.props

    const isLoading = !audiofileUrl && !this.state.isLoading;

    analytics.trackEvent('click_play', articleId)

    this.setState({ isPlaying: true, isLoading, audiofileUrl: this.props.audiofileUrl })
  }

  muteAudio = () => {
    this.setState({ isMuted: true })
  }

  unmuteAudio = () => {
    this.setState({ isMuted: false })
  }

  loopAudio = () => {
    this.setState({ isLooped: true })
  }

  unloopAudio = () => {
    this.setState({ isLooped: false })
  }

  pauseAudio = () => {
    const { articleId } = this.props
    analytics.trackEvent('click_pause', articleId)
    this.setState({ isPlaying: false, isLoading: false })
  }

  handleOnClickPlayPause = () => {
    const { isPlaying } = this.state

    if (isPlaying) {
      return this.pauseAudio();
    }

    return this.playAudio();
  }

  handleVolumeChange = (e: any) => {
    this.setState({ volume: parseFloat(e.target.value) })
  }

  handleToggleMuted = () => {
    const { isMuted } = this.state
    this.setState({ isMuted: !isMuted })
  }

  handleSetPlaybackRate = (e: any) => {
    this.setState({ playbackRate: parseFloat(e.target.value) })
  }

  handleOnPlay = () => {
    console.log('handleOnPlay')
    this.setState({ isPlaying: true, isLoading: false })
  }

  handleOnPause = () => {
    console.log('handleOnPause')
    this.setState({ isPlaying: false })
  }

  handleRangeOnChange = (value: number[]) => {
    console.log('handleRangeOnChange', value)

    this.setState({ played: value[0], isSeeking: true })
  }

  handleRangeOnFinalChange = (value: number[]) => {
    this.setState({ isSeeking: false })

    console.log('handleRangeOnFinalChange', value)

    if (this.playerRef && this.playerRef.current) {
      this.playerRef.current.seekTo(value[0])
    }
  }

  handleOnProgress = (
    progressState: {
      played: number,
      playedSeconds: number,
      loaded: number,
      loadedSeconds: number
    }
  ) => {
    const { isSeeking, duration } = this.state;
    console.log('handleOnProgress', progressState)

    // We only want to update time slider if we are not currently isSeeking
    if (!isSeeking) {
      this.playerjsReceiver.emit('timeupdate', {
        seconds: progressState.playedSeconds,
        duration
      });

      this.setState({
        ...progressState,
        isLoading: false
      })
    }
  }

  handleOnEnded = () => {
    console.log('handleOnEnded')
    this.playerjsReceiver.emit('ended')
    this.setState({ isPlaying: false })
  }

  handleOnDuration = (duration: number) => {
    console.log('handleOnDuration', duration)
    this.setState({ duration })
  }

  handleOnError = (error: any, data?: any) => {
    this.setState({ isLoading: false, isPlaying: false })
  }

  handleOnSeek = (seconds: number) => {
    console.log('handleOnSeek', seconds)
  }

  handleOnBuffer = () => {
    console.log('handleOnBuffer')
  }

  handleOnStart = () => {
    console.log('handleOnStart')
  }

  handleOnReady = () => {
    this.playerjsReceiver.ready();
    console.log('handleOnReady')
  }

  handleOnClickTryAgain = () => {
    console.log('handleOnClickTryAgain')
    window.location.reload()
  }

  handleOnClickSave = () => {
    const { platform } = this.state
    const { articleId, articleTitle } = this.props

    window.location.href = `playpost://playlist/add/${articleId}?title=${articleTitle}`;

    const appStoreUrl = platform === 'ios' ? URL_APPLE_APP_STORE : platform === 'android' ? URL_GOOGLE_PLAY_STORE : ''

    if (appStoreUrl) {
      analytics.trackEvent('click_save', this.props.articleId, {
        platform,
        appStoreUrl
      })

      this.setState({ showAppStoresModal: true })

      // this.appStoreRedirect = window.setTimeout(() => {
      //   window.location.href = appStoreUrl
      // }, 1000);
    } else {
      analytics.trackEvent('click_save', this.props.articleId, {
        platform
      })

      this.setState({ showAppStoresModal: true })
    }

  }

  handleOnClickCloseAppStoresModal = () => {
    this.setState({ showAppStoresModal: false })
  }

  handleOnClickCloseErrorModal = () => {
    this.setState({ isError: false })
  }

  handleOnClickToggleSettings = () => {
    const { showSettingsModal } = this.state
    this.setState({ showSettingsModal: !showSettingsModal })
    console.log('handleOnClickToggleSettings')
  }

  render () {
    const { isPlaying, volume, isMuted, isLooped, played, duration, playbackRate, audiofileUrl, isLoading, isError, loaded, showAppStoresModal } = this.state
    const { articleTitle, themeOptions, type, playerOptions } = this.props

    const buttonThemeStyle: React.CSSProperties = { backgroundColor: themeOptions.buttonColor }
    const playerContainerThemeStyle: React.CSSProperties = { backgroundColor: themeOptions.backgroundColor, borderColor: themeOptions.borderColor }
    const titleThemeStyle: React.CSSProperties = { color: themeOptions.titleColor }
    const trackThumbStyle: React.CSSProperties = { backgroundColor: themeOptions.trackThumbColor }
    const trackLabelStyle: React.CSSProperties = { backgroundColor: themeOptions.trackLabelBackgroundColor }

    return (
      <div className="Player">
        {isError && (
          <Modal onClickClose={this.handleOnClickCloseErrorModal} />
        )}

        {showAppStoresModal && (
          <Modal onClickClose={this.handleOnClickCloseAppStoresModal}>
            <ModalContentAppStores />
          </Modal>
        )}

        <div className="Player__container" style={playerContainerThemeStyle}>
          <ReactPlayer
            ref={this.playerRef}
            className="Player__react-player"
            width="100%"
            height="100%"
            url={audiofileUrl}
            playing={isPlaying}
            controls={false}
            playbackRate={playbackRate}
            volume={volume}
            muted={isMuted}
            progressInterval={1000}
            loop={isLooped}
            config={{
              file: {
                forceAudio: true
              }
            }}
            onReady={this.handleOnReady}
            onStart={this.handleOnStart}
            onPlay={this.handleOnPlay}
            onPause={this.handleOnPause}
            onBuffer={this.handleOnBuffer}
            onSeek={this.handleOnSeek}
            onEnded={this.handleOnEnded}
            onError={this.handleOnError}
            onProgress={this.handleOnProgress}
            onDuration={this.handleOnDuration}
          />

          <div className="Player__top-container">
            <div className="Player__play-control-container">
              <button
                type="button"
                disabled={isLoading}
                className="Player__play-control-button"
                onClick={this.handleOnClickPlayPause}
                style={buttonThemeStyle}
              >
                {isLoading && <Icons.Loading />}
                {!isLoading && isPlaying ? <Icons.Pause /> : !isLoading ? <Icons.Play /> : ''}
              </button>
            </div>
            <div className="Player__info-container">
              <div className="Player__info-meta">
                <h1 className="Player__title" style={titleThemeStyle}>
                  {playerOptions.hideTitle ? 'Listen to this story' : articleTitle}
                </h1>
                <a href={URL_PLAYPOST_WEBSITE} className="Player__branding">by Playpost</a>
              </div>

              {!playerOptions.hidePlaylistButton && (
                <div className="Player__top-actions-container">
                  <Button onClick={this.handleOnClickSave}>Add to playlist</Button>
                </div>
              )}

              <ProgressControl
                rangeStep={this.rangeStep}
                rangeMin={this.rangeMin}
                rangeMax={this.rangeMax}
                onRangeChange={this.handleRangeOnChange}
                onRangeFinalChange={this.handleRangeOnFinalChange}
                played={played}
                loaded={loaded}
                duration={duration}
                isPlaying={isPlaying}
                themeOptions={themeOptions}
                trackThumbStyle={trackThumbStyle}
                trackLabelStyle={trackLabelStyle}
                type={type}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
