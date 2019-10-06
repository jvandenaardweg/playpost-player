import React from 'react';
import './App.scss';
import { Player, PlayerThemeOptions } from './components/Player';

const App: React.FC = () => {
  /**
   * Regex to check if the given color code (hex value) is correct.
   *
   * @param text
   */
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

  return (
    <div className="App">
      <Player
        articleId="c67ffc85-2c6c-457d-80bd-42e1c78f500c"
        // url="https://storage.playpost.app/articles/c67ffc85-2c6c-457d-80bd-42e1c78f500c/audiofiles/f34ceeab-faf4-475f-a3f9-8f378d624e81.mp3"
        url="https://storage.playpost.app/articles/c67ffc85-2c6c-457d-80bd-42e1c78f500c/audiofiles/test.mp3"
        // url="https://storage-development.playpost.app/articles/09e78332-5cfa-4c2d-9288-656503e02df9/audiofiles/c3332c2b-b505-4071-95a7-8a6451ae510b.mp3"
        articleTitle="Trump Envoys Pushed Ukraine to Commit to Investigating Biden"
        articleUrl="https://www.nytimes.com/2019/10/03/us/politics/trump-ukraine.html?smid=nytcore-ios-share"
        voice="Emily (en-US)"
        articleSource="BBC News"
        duration={685.85}
        themeOptions={playerThemeOptions}
      />
    </div>
  );
}

export default App;
