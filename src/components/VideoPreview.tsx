import React from 'react';

interface VideoPreviewProps {
  videoSrc: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoSrc }) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Recorded Video</h2>
      <video controls className="w-full max-w-full rounded-lg">
        <source src={videoSrc} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      <a
        href={videoSrc}
        download="recorded_video.webm"
        className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Download Video
      </a>
    </div>
  );
};

export default VideoPreview;

