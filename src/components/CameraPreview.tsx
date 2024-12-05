import React, { useEffect, useRef } from 'react';

interface CameraPreviewProps {
  cameraId: string;
  aspectRatio: '9:16' | '16:9';
}

const CameraPreview: React.FC<CameraPreviewProps> = ({ cameraId, aspectRatio }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: cameraId ? { exact: cameraId } : undefined },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();
  }, [cameraId]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      className={`rounded-lg ${aspectRatio === '9:16' ? 'aspect-video' : 'aspect-video'}`}
    ></video>
  );
};

export default CameraPreview;
