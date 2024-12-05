import React, { useState } from 'react';
import TeleprompterText from './components/TeleprompterText';
import ScrollPreview from './components/ScrollPreview';
import RecordingOptions from './components/RecordingOptions';
import Controls from './components/Controls';
import VideoPreview from './components/VideoPreview';

const App: React.FC = () => {
  const [text, setText] = useState<string>('Welcome to the Teleprompter App!');
  const [fontSize, setFontSize] = useState<number>(24);
  const [scrollSpeed, setScrollSpeed] = useState<number>(50);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    // Initialize recording and start scrolling
  };

  const handlePauseRecording = () => {
    setIsPaused(!isPaused);
    // Pause or resume recording and scrolling
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    // Stop recording and capture video
    setRecordedVideo('path_to_recorded_video.webm'); // Placeholder
  };

  return (
    <div className="max-w-[900px] mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Teleprompter App</h1>

      {/* Teleprompter Text Area and Controls */}
      <TeleprompterText text={text} setText={setText} />
      <Controls
        fontSize={fontSize}
        setFontSize={setFontSize}
        scrollSpeed={scrollSpeed}
        setScrollSpeed={setScrollSpeed}
      />
      <ScrollPreview text={text} fontSize={fontSize} scrollSpeed={scrollSpeed} />

      {/* Recording Options */}
      <RecordingOptions />

      {/* Recording Controls */}
      <div className="flex justify-center mt-6">
        {!isRecording && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleStartRecording}
          >
            Start Recording
          </button>
        )}
        {isRecording && (
          <>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded mr-4"
              onClick={handlePauseRecording}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              onClick={handleStopRecording}
            >
              Stop Recording
            </button>
          </>
        )}
      </div>

      {/* Video Preview */}
      {recordedVideo && <VideoPreview videoSrc={recordedVideo} />}
    </div>
  );
};

export default App;
