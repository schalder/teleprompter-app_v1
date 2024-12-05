import React, { useState } from 'react';
import RecordingOptions from './RecordingOptions';
import VideoRecorder from './VideoRecorder';
import VideoPlayer from './VideoPlayer';

const App: React.FC = () => {
  const [showOptions, setShowOptions] = useState(true);
  const [constraints, setConstraints] = useState<MediaStreamConstraints | null>(
    null
  );
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const handleStartRecording = (constraints: MediaStreamConstraints) => {
    setConstraints(constraints);
    setShowOptions(false);
  };

  const handleRecordingComplete = (blob: Blob) => {
    setRecordedBlob(blob);
  };

  const handleRecordAgain = () => {
    setRecordedBlob(null);
    setShowOptions(true);
  };

  return (
    <div>
      {showOptions && <RecordingOptions onStartRecording={handleStartRecording} />}
      {!showOptions && !recordedBlob && constraints && (
        <VideoRecorder
          constraints={constraints}
          onRecordingComplete={handleRecordingComplete}
          onBack={() => setShowOptions(true)}
        />
      )}
      {recordedBlob && (
        <VideoPlayer
          videoBlob={recordedBlob}
          onRecordAgain={handleRecordAgain}
        />
      )}
    </div>
  );
};

export default App;
