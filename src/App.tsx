import React from 'react';
import './App.scss';
import { Player, PlayerThemeOptions } from './components/Player';
import { Api } from '../@types/playpost-api';

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
    const hex = `#${colorCode}`;
    const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    return regex.test(hex);
  }

  const getUserDefinedPlayerThemeOptions = () => {
    const urlParams = new window.URLSearchParams(window.location.search);

    const defaultOptions: PlayerThemeOptions = {
      buttonColor: '#0066FF', // tintColor
      backgroundColor: '#ffffff',
      borderColor: '#e5e5e5', // grayLight
      titleColor: '#000000',
      trackBackgroundColor: '#000000',
      trackThumbColor: '#000000',
      trackLabelBackgroundColor: '#000000'
    }

    let options: PlayerThemeOptions = {
      ...defaultOptions
    }

    for (const [key] of Object.entries(defaultOptions)) {
      const paramValue = urlParams.get(key)
      if (paramValue && isCorrectColorCode(paramValue)) {
        options = {
          ...options,
          [key]: `#${paramValue}`
        }
      }
    }

    return options
  }

  const playerThemeOptions = getUserDefinedPlayerThemeOptions()

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
        articleTitle={article.title}
        articleUrl={article.url}
        articleSourceName={article.sourceName}
        voiceLabel={audiofile.voice.label}
        voiceLanguageCode={audiofile.voice.languageCode}
        audiofileUrl={audiofile.url}
        audiofileLength={audiofile.length}
        themeOptions={playerThemeOptions}
      />
    </div>
  );
}

export default App;
