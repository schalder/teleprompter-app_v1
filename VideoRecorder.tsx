import React, { useEffect, useRef, useState } from 'react';

interface VideoRecorderProps {
  constraints: MediaStreamConstraints;
  onRecordingComplete: (blob: Blob) => void;
  onBack: () => void;
}

const VideoRecorder: React.FC<VideoRecorderProps> = ({
  constraints,
  onRecordingComplete,
  onBack,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [recording, setRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play();
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    };

    startStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [constraints]);

  const startRecording = () => {
    if (canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const [width, height] = [
        canvas.width,
        canvas.height,
      ];

      const ctx = canvas.getContext('2d');

      const draw = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          requestAnimationFrame(draw);
        }
      };

      draw();

      const canvasStream = canvas.captureStream(30);

      // Add audio tracks if available
      if (stream) {
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => canvasStream.addTrack(track));
      }

      const options = { mimeType: 'video/webm; codecs=vp9' };
      const mediaRecorder = new MediaRecorder(canvasStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        setChunks((prev) => [...prev, e.data]);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        onRecordingComplete(blob);
        setChunks([]);
      };

      mediaRecorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const [canvasWidth, canvasHeight] = [
    constraints.video && (constraints.video as any).width?.ideal || 640,
    constraints.video && (constraints.video as any).height?.ideal || 480,
  ];

  return (
    <div>
      <button onClick={onBack}>Back</button>
      <div>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            transform: 'scaleX(-1)',
            display: 'none',
          }}
          playsInline
          muted
        ></video>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{
            width: '100%',
            transform: 'scaleX(-1)',
          }}
        ></canvas>
      </div>
      {!recording && <button onClick={startRecording}>Start Recording</button>}
      {recording && <button onClick={stopRecording}>Stop Recording</button>}
    </div>
  );
};

export default VideoRecorder;
