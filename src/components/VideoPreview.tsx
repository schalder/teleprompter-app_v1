import React from 'react';

interface VideoPreviewProps {
  videoUrl: string;
  onRecordAgain: () => void;
  mimeType: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoUrl, onRecordAgain, mimeType }) => {
  const getExtensionFromMimeType = (mimeType: string): string => {
    switch (mimeType) {
      case 'video/webm':
      case 'video/webm;codecs=vp8':
      case 'video/webm;codecs=vp8,opus':
        return 'webm';
      case 'video/mp4':
        return 'mp4';
      case 'video/x-matroska':
        return 'mkv';
      default:
        return 'webm';
    }
  };

  const extension = getExtensionFromMimeType(mimeType);

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <video src={videoUrl} controls className="w-full max-w-md" />
      <div className="flex flex-wrap justify-center space-x-4">
        <a
          href={videoUrl}
          download={`recorded-video.${extension}`}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Download Video
        </a>
        {extension !== 'mp4' && (
          <a
            href="https://vid2mp4.sideeffect.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Convert to MP4 (external)
          </a>
        )}
        <button
          onClick={onRecordAgain}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Record Again
        </button>
      </div>
    </div>
  );
};

export default VideoPreview;
