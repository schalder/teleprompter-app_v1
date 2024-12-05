import React, { useRef, useEffect } from 'react';

const CameraPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Error accessing camera. Please check your camera permissions.');
      }
    };

    getCameraStream();

    return () => {
      // Stop all video tracks when the component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div>
      <h2>Camera Preview</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '100%', height: 'auto' }}
      ></video>
    </div>
  );
};

export default CameraPreview;
