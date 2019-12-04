import React from 'react';
import './App.scss';
import { Player, PlayerThemeOptions, PlayerType, PlayerOptions } from './components/Player';
import { Api } from '../@types/playpost-api';
import md5 from 'md5';
import * as Sentry from '@sentry/browser';
import { version } from '../../package.json';

// Error tracking in the player
Sentry.init({
  dsn: "https://bbd40ef86777499e9ed44a185b87069a@sentry.io/1844201",
  enabled: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test', // Do not run on your local machine
  environment: process.env.NODE_ENV,
  release: version ? version : undefined,
});

const App: React.FC = () => {
  /**
   * Regex to check if the given color code (hex value) is correct.
   *
   * @param text
   */

  // @ts-ignore
  const article: Api.Article | null = (typeof window !== 'undefined' && window.article) ? window.article : null;

  // @ts-ignore
  const audiofile: Api.Audiofile | null = (typeof window !== 'undefined' && window.audiofile) ? window.audiofile : null;

  const isCorrectColorCode = (colorCode: string): boolean => {
    const colorCodeLowerCase = colorCode.toLowerCase();
    const hex = `#${colorCodeLowerCase}`;
    const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return regex.test(hex);
  }

  const getUserDefinedPlayerOptions = (): PlayerOptions => {
    const urlParams = new window.URLSearchParams(window.location.search);

    const defaultOptions: PlayerOptions = {
      hideTitle: false, // Hides the article title, will show "Listen to this story" instead
      hidePlaylistButton: false, // Hides the "Add to playlist" button
      hideProgressTime: false, // Hides the times next to the progress bar
      hideTrack: false, // Hides the progress bar with the times
      autoplay: false
    }

    let options: PlayerOptions = {
      ...defaultOptions
    }

    for (const [key] of Object.entries(defaultOptions)) {
      const paramValue = urlParams.get(key)
      if (paramValue === 'true' || paramValue === '1') {
        options = {
          ...options,
          [key]: true
        }
      }
    }

    return options
  }

  const getUserDefinedPlayerType = (): PlayerType => {
    const urlParams = new window.URLSearchParams(window.location.search);

    const paramValue = urlParams.get('type')

    if (!paramValue) {
      return PlayerType.normal
    }

    return paramValue as PlayerType
  }

  const getUserDefinedPlayerThemeOptions = () => {
    const urlParams = new window.URLSearchParams(window.location.search);

    const defaultOptions: PlayerThemeOptions = {
      buttonColor: '#0066FF', // tintColor
      buttonIconColor: '#ffffff',
      backgroundColor: 'transparent',
      borderColor: '#e5e5e5', // grayLight
      titleColor: '#000000',
      trackBackgroundColor: '#000000',
      trackThumbColor: '#000000',
      trackLabelBackgroundColor: '#000000',
      borderRadius: '6px',
      padding: '18px'
    }

    let options: PlayerThemeOptions = {
      ...defaultOptions
    }

    for (const [key] of Object.entries(defaultOptions)) {
      const paramValue = urlParams.get(key)
      if (paramValue) {
        options = {
          ...options,
          [key]: isCorrectColorCode(paramValue) ? `#${paramValue}` : paramValue
        }
      }
    }

    return options
  }

  const playerThemeOptions = getUserDefinedPlayerThemeOptions()
  const playerType = getUserDefinedPlayerType()
  const playerOptions = getUserDefinedPlayerOptions()

  // Generate a sessionId so we can keep track of player sessions for statistics
  const sessionId = md5(new Date().getTime().toString() + Math.floor((Math.random() * 1000000)));

  if (!article) {
    return (
      <div className="App">
        <p>could not get article</p>
      </div>
    )
  }

  if (!audiofile) {
    return (
      <div className="App">
        <p>could not get audiofile</p>
      </div>
    )
  }

  return (
    <div className="App">
      <Player
        articleId={article.id}
        audiofileId={audiofile.id}
        articleTitle={article.title}
        articleUrl={article.canonicalUrl || article.url}
        articleSourceName={article.sourceName}
        voiceLabel={audiofile.voice.label}
        voiceLanguageCode={audiofile.voice.languageCode}
        audiofileUrl={audiofile.url}
        audiofileLength={audiofile.length}
        themeOptions={playerThemeOptions}
        playerOptions={playerOptions}
        type={playerType}
        sessionId={sessionId}
      />
    </div>
  );
}

export default App;
