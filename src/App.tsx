import React, { useState, useRef } from 'react';
import Teleprompter from './components/Teleprompter';
import RecordingModal from './components/RecordingModal';
import VideoPreview from './components/VideoPreview';

const App: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [recordingOptions, setRecordingOptions] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks: BlobPart[] = [];

  const handleStartRecording = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleRecordingStart = async (options: any) => {
    setRecordingOptions(options);
    setShowModal(false);

    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: options.videoDeviceId,
        width: { exact: parseInt(options.resolution.split('x')[0]) },
        height: { exact: parseInt(options.resolution.split('x')[1]) },
      },
      audio: { deviceId: options.audioDeviceId },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsRecording(false);
  };

  const handleRecordAgain = () => {
    setVideoUrl('');
    setRecordingOptions(null);
    setIsRecording(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {!videoUrl ? (
        <>
          <Teleprompter onStartRecording={handleStartRecording} />
          {showModal && (
            <RecordingModal
              onClose={handleModalClose}
              onStart={handleRecordingStart}
            />
          )}
          {isRecording && (
            <div className="fixed inset-0 bg-white flex flex-col items-center p-4">
              <video ref={videoRef} autoPlay className="w-full max-w-md" />
              <button
                onClick={handleStopRecording}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                Stop Recording
              </button>
            </div>
          )}
        </>
      ) : (
        <VideoPreview videoUrl={videoUrl} onRecordAgain={handleRecordAgain} />
      )}
    </div>
  );
};

export default App;
