import React from 'react'
import ReactPlayer from 'react-player';
import { Range } from 'react-range';

import { Duration } from '../Duration';

import './index.css'

interface Props {
  url: string;
  articleTitle: string;
  articleUrl: string;
  articleSource: string;
  voice: string;
  saveUrl: string;
  duration: number;
}

interface State {
  url: string;
  isError: boolean;
  isLoading: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  isSeeking: boolean;
  isReady: boolean;
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
    isError: false,
    isLoading: false,
    isPlaying: false,
    isMuted: false,
    isSeeking: false,
    isReady: false,
    volume: 1.0,
    duration: 0,
    playbackRate: 1.0,
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0
  }

  private playerRef = React.createRef<ReactPlayer>()

  componentDidMount() {
    this.setState({ duration: this.props.duration })
  }

  handleOnClickPlayPause = () => {
    const { isPlaying, url } = this.state

    const isLoading = !url && !this.state.isLoading;

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
    const { isPlaying } = this.state;

    console.log('handleRangeOnChange', value)

    if (isPlaying) {
      this.setState({ played: value[0], isSeeking: true })
    }
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

  render () {
    const { isPlaying, volume, isMuted, played, duration, playbackRate, url, isLoading, isError } = this.state
    const { articleTitle, articleUrl, saveUrl, voice, articleSource } = this.props

    return (
      <div className="Player">
        {isError && (
          <PlayerModal
            title="A unknown error happened"
            text="Please try again"
            onClickTryAgain={this.handleOnClickTryAgain}
          />
        )}
        <div className="Player__container">
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
              <button type="button" disabled={isLoading} className="Player__play-control-button" onClick={this.handleOnClickPlayPause}>
                {isLoading && <IconLoading />}
                {!isLoading && isPlaying ? <IconPause /> : !isLoading ? <IconPlay /> : null}
              </button>
            </div>
            <div className="Player__info-container">
              <h1 className="Player__title"><a href={articleUrl}>{articleTitle}</a></h1>
              <h2 className="Player__subtitle"><a href={articleUrl}>{articleSource}</a>, by Author Name. Voice: <button type="button"><span>{voice}</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button></h2>
            </div>
          </div>
          <div className="Player__bottom-container">
            <div className="Player__progress-container">
              <div className="Player__progress-control-container">
              <Range
                step={0.00000000001}
                min={0}
                max={1}
                values={[played]}
                onChange={this.handleRangeOnChange}
                onFinalChange={this.handleRangeOnFinalChange}
                renderTrack={({ props, children }) => (
                  <div {...props} className="Player__range-track-container">
                    {children}
                  </div>
                )}
                renderThumb={({ props, isDragged }) => (
                  <div {...props} className="Player__range-thumb-container">
                    <div className={`Player__range-thumb ${isDragged ? 'Player__range-thumb--is-dragging' : null}`}></div>
                    {isDragged && (
                      <div className="Player__range-thumb-label">
                        <Duration seconds={duration * played} />
                      </div>
                    )}
                  </div>
                )}
              />
              </div>
              <div className="Player__progress-time-container">
                <div className="Player__progress-time Player__progress-time--played">
                  <Duration seconds={duration * played} />
                </div>
                <div className="Player__progress-time Player__progress-time--remaining">
                  <Duration seconds={duration * (1 - played)} />
                </div>
              </div>
              <div>
              <div>
                <a href={saveUrl}>Save to Playpost</a></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    )
  }
}

export const IconLoading: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 100 100" width="20" height="20">
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8">
      <animate attributeName="opacity" begin="-0.9166666666666666s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(30 50 50)">
      <animate attributeName="opacity" begin="-0.8333333333333334s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(60 50 50)">
      <animate attributeName="opacity" begin="-0.75s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(90 50 50)">
      <animate attributeName="opacity" begin="-0.6666666666666666s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(120 50 50)">
      <animate attributeName="opacity" begin="-0.5833333333333334s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(150 50 50)">
      <animate attributeName="opacity" begin="-0.5s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(180 50 50)">
      <animate attributeName="opacity" begin="-0.4166666666666667s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(210 50 50)">
      <animate attributeName="opacity" begin="-0.3333333333333333s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(240 50 50)">
      <animate attributeName="opacity" begin="-0.25s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(270 50 50)">
      <animate attributeName="opacity" begin="-0.16666666666666666s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(300 50 50)">
      <animate attributeName="opacity" begin="-0.08333333333333333s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
    <rect width="6" height="12" x="47" y="24" fill="#fff" rx="9.4" ry="4.8" transform="rotate(330 50 50)">
      <animate attributeName="opacity" begin="0s" dur="1s" keyTimes="0;1" repeatCount="indefinite" values="1;0"/>
    </rect>
  </svg>
)


export const IconPause: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
    <path fill="#FFF" fillRule="evenodd" d="M2.667 20c1.466 0 2.666-1.286 2.666-2.857V2.857C5.333 1.286 4.133 0 2.667 0 1.2 0 0 1.286 0 2.857v14.286C0 18.714 1.2 20 2.667 20zm8-17.143v14.286c0 1.571 1.2 2.857 2.666 2.857C14.8 20 16 18.714 16 17.143V2.857C16 1.286 14.8 0 13.333 0c-1.466 0-2.666 1.286-2.666 2.857z"/>
  </svg>
)

export const IconPlay: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20">
    <path fill="#FFF" fillRule="evenodd" d="M0 1.551v16.047c0 1.224 1.372 1.968 2.429 1.302l12.838-8.024a1.535 1.535 0 0 0 0-2.618L2.429.25C1.372-.416 0 .327 0 1.551z"/>
  </svg>
)


interface PlayerModalProps {
  title: string;
  text: string;
  onClickTryAgain(): void
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ title, text, onClickTryAgain }) => (
  <div className="Player__modal">
    <div className="Player__modal-content">
      <h2 className="Player__modal-title">{title}</h2>
      <p>{text}</p>
      <button type="button" onClick={onClickTryAgain}>Try again</button>
    </div>
  </div>
)
