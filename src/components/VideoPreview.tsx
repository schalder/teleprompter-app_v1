import React from 'react';

interface VideoPreviewProps {
  videoUrl: string;
  onRecordAgain: () => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, onRecordAgain }) => {
  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <video src={videoUrl} controls className="w-full max-w-md" />
      <div className="flex space-x-4">
        <a
          href={videoUrl}
          download="recorded-video.mp4"
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Download Video
        </a>
        <button
          onClick={onRecordAgain}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Record Again
        </button>
      </div>
    </div>
  );
};

export default VideoPreview;
