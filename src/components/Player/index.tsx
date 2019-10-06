import React from 'react'
import ReactPlayer from 'react-player';
import { Range, getTrackBackground } from 'react-range';

import { Duration } from '../Duration';

import * as analytics from '../../utils/analytics'

import './index.scss'

import { URL_APPLE_APP_STORE, URL_GOOGLE_PLAY_STORE, URL_PLAYPOST_WEBSITE } from '../../constants/urls';
import { getPlatform } from '../../utils/platform';
import { Button } from '../Button';
import { Modal, ModalContentAppStores } from '../Modal';
import * as Icons from '../Icons';

export interface PlayerThemeOptions {
  buttonColor: string;
  backgroundColor: string;
  borderColor: string;
  titleColor: string;
  trackBackgroundColor: string;
  trackThumbColor: string;
  trackLabelBackgroundColor: string;
}

interface Props {
  url: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  articleSource: string;
  voice: string;
  duration: number;
  themeOptions: PlayerThemeOptions
}

interface State {
  url: string;
  platform: string;
  isError: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isSeeking: boolean;
  isReady: boolean;
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
    url: '',
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
  }

  private playerRef = React.createRef<ReactPlayer>()
  private rangeMin = 0;
  private rangeMax = 1;
  private rangeStep = 0.0001;

  private appStoreRedirect: number | null = null

  componentDidMount() {
    const { duration, themeOptions } = this.props
    const platform = getPlatform(navigator)

    this.setState({ duration, platform })

    console.log('Playpost Player Init: Using themeOptions: ', themeOptions)
    console.log('Playpost Player Init: Using duration: ', duration)
    console.log('Playpost Player Init: Using platform: ', platform)
  }

  componentWillUnmount() {
    if (this.appStoreRedirect) {
      window.clearTimeout(this.appStoreRedirect)
      this.appStoreRedirect = null
    }
  }

  handleOnClickPlayPause = () => {
    const { isPlaying, url } = this.state

    const isLoading = !url && !this.state.isLoading;

    if (isPlaying) {
      analytics.trackEvent('click_pause', this.props.articleId)
    } else {
      analytics.trackEvent('click_play', this.props.articleId)
    }

    this.setState({ isPlaying: !isPlaying, isLoading, url: this.props.url })
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
    const { isSeeking } = this.state;
    console.log('handleOnProgress', progressState)

    // We only want to update time slider if we are not currently isSeeking
    if (!isSeeking) {
      this.setState({
        ...progressState,
        isLoading: false
      })
    }
  }

  handleOnEnded = () => {
    console.log('handleOnEnded')
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
    console.log('handleOnReady')
  }

  handleOnClickTryAgain = () => {
    console.log('handleOnClickTryAgain')
    window.location.reload()
  }

  handleOnClickSave = () => {
    const { platform } = this.state
    const { articleId } = this.props

    window.location.href = `playpost://playlist/add/${articleId}`;

    const appStoreUrl = platform === 'ios' ? URL_APPLE_APP_STORE : platform === 'android' ? URL_GOOGLE_PLAY_STORE : null

    if (appStoreUrl) {
      analytics.trackEvent('click_save', this.props.articleId, {
        platform,
        appStoreUrl
      })

      this.setState({ showAppStoresModal: true })

      this.appStoreRedirect = window.setTimeout(() => {
        window.location.href = URL_APPLE_APP_STORE
      }, 1000);
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
    const { isPlaying, volume, isMuted, played, duration, playbackRate, url, isLoading, isError, loaded, showAppStoresModal, showSettingsModal } = this.state
    const { articleTitle, articleUrl, voice, articleSource, themeOptions } = this.props

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

        {showSettingsModal && (
          <Modal onClickClose={this.handleOnClickToggleSettings}>
            <p>Choose a voice</p>
          </Modal>
        )}

        <div className="Player__container" style={playerContainerThemeStyle}>
          <ReactPlayer
            ref={this.playerRef}
            className="Player__react-player"
            url={url}
            playing={isPlaying}
            controls={false}
            playbackRate={playbackRate}
            volume={volume}
            muted={isMuted}
            progressInterval={1000}
            loop={false}
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
                {!isLoading && isPlaying ? <Icons.Pause /> : !isLoading ? <Icons.Play /> : null}
              </button>
            </div>
            <div className="Player__info-container">
              <div>
                <h1 className="Player__title" style={titleThemeStyle}>
                  <a href={articleUrl} style={titleThemeStyle}>{articleTitle}</a>
                  </h1>
                <h2 className="Player__subtitle">
                  <a href={articleUrl}>{articleSource}</a>, voice: {voice}
                </h2>
              </div>
              <div className="Player__action">
                <Button onClick={this.handleOnClickSave}>Save to Playpost</Button>
              </div>
            </div>
            {/* <div className="Player__top-actions-container">
              <Button onClick={this.handleOnClickSave}>Save to Playpost</Button> &nbsp;
              <Button onClick={this.handleOnClickToggleSettings} type="clean"><Icons.Settings /></Button>
            </div> */}
          </div>
          <div className="Player__bottom-container">
            <div className="Player__progress-container">
              <div className="Player__progress-control-container">
              <Range
                step={this.rangeStep}
                min={this.rangeMin}
                max={this.rangeMax}
                values={[played]}
                onChange={this.handleRangeOnChange}
                onFinalChange={this.handleRangeOnFinalChange}
                renderTrack={({ props, children }) => (
                  <div onMouseDown={props.onMouseDown} onTouchStart={props.onTouchStart} className="Player__range-track-container">
                    <div
                      ref={props.ref}
                      style={{
                        ...props.style,
                        background: getTrackBackground({
                          values: [played, loaded],
                          colors: [themeOptions.trackBackgroundColor, '#AAAAAA', '#e5e5e5'],
                          min: this.rangeMin,
                          max: this.rangeMax
                        })
                      }}
                      className="Player__range-track-inner">
                        {children}
                      </div>
                  </div>

                )}
                renderThumb={({ props, isDragged }) => (
                  <div {...props} className="Player__range-thumb-container">
                    <div
                      className={`Player__range-thumb ${isDragged ? 'Player__range-thumb--is-dragging' : null}`}
                      style={trackThumbStyle}
                    ></div>
                    {isDragged && (
                      <div className="Player__range-thumb-label" style={trackLabelStyle}>
                        <Duration seconds={duration * played} />
                      </div>
                    )}
                  </div>
                )}
              />
              </div>
              <div className="Player__progress-time-container">
                <div className={`Player__progress-time Player__progress-time--played ${isPlaying ? 'is-playing' : null}`}>
                  <Duration seconds={duration * played} />
                </div>
                <a href={URL_PLAYPOST_WEBSITE} className="Player__progress-time-branding" target="_blank" rel="noopener noreferrer">Audio by <span>Playpost</span></a>
                <div className={`Player__progress-time Player__progress-time--remaining ${isPlaying ? 'is-playing' : null}`}>
                  <Duration seconds={duration * (1 - played)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
