import React, { useState, useRef } from 'react';
import Teleprompter from './components/Teleprompter';
import RecordingModal from './components/RecordingModal';
import VideoPreview from './components/VideoPreview';

const App: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoMimeType, setVideoMimeType] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks: BlobPart[] = [];
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [startScrolling, setStartScrolling] = useState(false);

  const handleStartRecording = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleRecordingStart = async (options: any) => {
    setShowModal(false);
    setIsCameraRecording(options.isCameraRecording);

    try {
      let stream: MediaStream;

      if (options.isCameraRecording) {
        const [width, height] = options.resolution.split('x').map(Number);
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: options.videoDeviceId ? { exact: options.videoDeviceId } : undefined,
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 30 },
          },
          audio: options.audioDeviceId ? { exact: options.audioDeviceId } : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Determine the best available MIME type
      let optionsForRecorder = { mimeType: 'video/webm;codecs=vp8,opus' };
      if (!MediaRecorder.isTypeSupported(optionsForRecorder.mimeType)) {
        optionsForRecorder = { mimeType: 'video/webm;codecs=vp8' };
        if (!MediaRecorder.isTypeSupported(optionsForRecorder.mimeType)) {
          optionsForRecorder = { mimeType: 'video/webm' };
          if (!MediaRecorder.isTypeSupported(optionsForRecorder.mimeType)) {
            optionsForRecorder = { mimeType: '' };
          }
        }
      }
      mediaRecorderRef.current = new MediaRecorder(stream, optionsForRecorder);
      setVideoMimeType(mediaRecorderRef.current.mimeType);

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunks.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: mediaRecorderRef.current?.mimeType });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStartScrolling(true); // Start scrolling from beginning

      // Navigate to teleprompter screen
      setShowTeleprompter(true);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert('Error accessing media devices. Please check your camera and microphone permissions.');
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
    setStartScrolling(false);
  };

  const handleRecordAgain = () => {
    setVideoUrl('');
    setIsRecording(false);
    setShowTeleprompter(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mt-6">Teleprompter For Digital Creators</h1>
      <div className="w-full max-w-[900px] p-4">
        {!videoUrl ? (
          <>
            {showTeleprompter && (
              <div className="relative">
                <Teleprompter
                  onStartRecording={handleStartRecording}
                  isRecording={isRecording}
                  isCameraRecording={isCameraRecording}
                  videoRef={videoRef}
                  startScrolling={startScrolling}
                  setStartScrolling={setStartScrolling}
                />
                {isRecording && isCameraRecording && (
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
                {isRecording && !isCameraRecording && (
                  <button
                    onClick={handleStopRecording}
                    className="fixed top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
                  >
                    Stop Recording
                  </button>
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
          <VideoPreview
            videoUrl={videoUrl}
            onRecordAgain={handleRecordAgain}
            mimeType={videoMimeType}
          />
        )}
      </div>
    </div>
  );
};

export default App;
