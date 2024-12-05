import React from 'react';
import TeleprompterText from './components/TeleprompterText';
import RecordingOptions from './components/RecordingOptions';

const App = () => {
  return (
    <div className="max-w-[900px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teleprompter App</h1>
      <TeleprompterText />
      <RecordingOptions />
    </div>
  );
};

export default App;
