import React, { useState } from "react";
import TeleprompterText from "./components/TeleprompterText";
import Controls from "./components/Controls";
import RecordingOptions from "./components/RecordingOptions";
import CameraPreview from "./components/CameraPreview";

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  return (
    <div className="max-w-[900px] mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Teleprompter App</h1>
      <TeleprompterText isRecording={isRecording} />
      <Controls
        isRecording={isRecording}
        onStart={() => setIsRecording(true)}
        onStop={() => setIsRecording(false)}
        setPreviewVideo={setPreviewVideo}
      />
      <RecordingOptions />
      {previewVideo && <CameraPreview previewVideo={previewVideo} />}
    </div>
  );
};

export default App;
