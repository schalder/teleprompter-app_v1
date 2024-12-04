import React, { useState, useRef } from 'react';
import Teleprompter from './components/Teleprompter';
import RecordingModal from './components/RecordingModal';
import VideoPreview from './components/VideoPreview';

const App: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks: BlobPart[] = [];
  const [showTeleprompter, setShowTeleprompter] = useState(true);

  const handleStartRecording = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleRecordingStart = async (options: any) => {
    setShowModal(false);

    try {
      let stream: MediaStream;

      if (options.isCameraRecording) {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: options.videoDeviceId,
            width: { exact: parseInt(options.resolution.split('x')[0]) },
            height: { exact: parseInt(options.resolution.split('x')[1]) },
          },
          audio: { deviceId: options.audioDeviceId },
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }

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

      // Navigate to teleprompter screen
      setShowTeleprompter(true);
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
    setIsRecording(false);
    setShowTeleprompter(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-3xl p-4">
        {!videoUrl ? (
          <>
            {showTeleprompter && (
              <div className="relative">
                <Teleprompter
                  onStartRecording={handleStartRecording}
                  isRecording={isRecording}
                />
                {isRecording && (
                  <>
                    <div className="absolute bottom-4 right-4 w-32 h-32 md:w-48 md:h-48">
                      <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <button
                      onClick={handleStopRecording}
                      className="fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Stop Recording
                    </button>
                  </>
                )}
              </div>
            )}
            {showModal && (
              <RecordingModal
                onClose={handleModalClose}
                onStart={handleRecordingStart}
              />
            )}
          </>
        ) : (
          <VideoPreview videoUrl={videoUrl} onRecordAgain={handleRecordAgain} />
        )}
      </div>
    </div>
  );
};

export default App;
