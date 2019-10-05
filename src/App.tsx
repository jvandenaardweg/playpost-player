import React from 'react';
import './App.css';
import { Player } from './components/Player';

const App: React.FC = () => {
  return (
    <div className="App">
      <Player
        // url="https://storage.playpost.app/articles/c67ffc85-2c6c-457d-80bd-42e1c78f500c/audiofiles/f34ceeab-faf4-475f-a3f9-8f378d624e81.mp3"
        url="https://storage.playpost.app/articles/c67ffc85-2c6c-457d-80bd-42e1c78f500c/audiofiles/test.mp3"
        // url="https://storage-development.playpost.app/articles/09e78332-5cfa-4c2d-9288-656503e02df9/audiofiles/c3332c2b-b505-4071-95a7-8a6451ae510b.mp3"
        articleTitle="Trump Envoys Pushed Ukraine to Commit to Investigating Biden"
        articleUrl="https://www.nytimes.com/2019/10/03/us/politics/trump-ukraine.html?smid=nytcore-ios-share"
        voice="Emily (en-US)"
        saveUrl="playpost://playlist/add/c67ffc85-2c6c-457d-80bd-42e1c78f500c"
        articleSource="BBC News"
        duration={685.85}
      />
    </div>
  );
}

export default App;
