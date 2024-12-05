import React from 'react';

interface VideoPlayerProps {
  videoBlob: Blob;
  onRecordAgain: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoBlob,
  onRecordAgain,
}) => {
  const videoUrl = URL.createObjectURL(videoBlob);

  return (
    <div>
      <h2>Recorded Video</h2>
      <video src={videoUrl} controls style={{ width: '100%' }}></video>
      <button onClick={onRecordAgain}>Record Again</button>
    </div>
  );
};

export default VideoPlayer;
