import React from "react";

interface Props {
  isRecording: boolean;
  onStart: () => void;
  onStop: () => void;
  setPreviewVideo: (video: string | null) => void;
}

const Controls: React.FC<Props> = ({ isRecording, onStart, onStop, setPreviewVideo }) => {
  return (
    <div className="flex items-center gap-2 my-4">
      {!isRecording ? (
        <button
          onClick={onStart}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Start Recording
        </button>
      ) : (
        <>
          <button
            onClick={onStop}
            className="bg-red-500 text-white px-4 py-2 rounded-md"
          >
            Stop Recording
          </button>
        </>
      )}
    </div>
  );
};

export default Controls;
