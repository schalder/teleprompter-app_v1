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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<BlobPart[]>([]);
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [startScrolling, setStartScrolling] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1920x1080');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const handleStartRecording = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleRecordingStart = async (options: any) => {
    setShowModal(false);
    setIsCameraRecording(options.isCameraRecording);
    setSelectedResolution(options.resolution);
    setSelectedAspectRatio(options.aspectRatio);

    try {
      const [canvasWidth, canvasHeight] = options.resolution
        .split('x')
        .map(Number);

      let stream: MediaStream;

      if (options.isCameraRecording) {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: options.videoDeviceId
              ? { exact: options.videoDeviceId }
              : undefined,
            width: { ideal: canvasWidth },
            height: { ideal: canvasHeight },
            frameRate: { ideal: 30 },
          },
          audio: options.audioDeviceId
            ? { deviceId: { exact: options.audioDeviceId } }
            : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }

      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Set canvas dimensions
        if (canvasRef.current) {
          canvasRef.current.width = canvasWidth;
          canvasRef.current.height = canvasHeight;
        }

        // Start drawing video to canvas
        const drawToCanvas = () => {
          if (canvasRef.current && videoRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.drawImage(
                videoRef.current,
                0,
                0,
                videoRef.current.videoWidth,
                videoRef.current.videoHeight,
                0,
                0,
                canvasWidth,
                canvasHeight
              );
            }
          }
          requestAnimationFrame(drawToCanvas);
        };

        drawToCanvas();

        // Get canvas stream for recording
        const canvasStream = canvasRef.current.captureStream(30);

        // Combine canvas stream with audio if available
        if (stream.getAudioTracks().length > 0) {
          const audioTracks = stream.getAudioTracks();
          audioTracks.forEach((track) => canvasStream.addTrack(track));
        }

        // Determine the best available MIME type
        let optionsForRecorder = { mimeType: 'video/webm;codecs=vp9,opus' };
        if (!MediaRecorder.isTypeSupported(optionsForRecorder.mimeType)) {
          optionsForRecorder = { mimeType: 'video/webm;codecs=vp8,opus' };
          if (!MediaRecorder.isTypeSupported(optionsForRecorder.mimeType)) {
            optionsForRecorder = { mimeType: 'video/webm' };
            if (!MediaRecorder.isTypeSupported(optionsForRecorder.mimeType)) {
              optionsForRecorder = { mimeType: '' };
            }
          }
        }
        mediaRecorderRef.current = new MediaRecorder(
          canvasStream,
          optionsForRecorder
        );
        setVideoMimeType(mediaRecorderRef.current.mimeType);

        mediaRecorderRef.current.ondataavailable = (e) => {
          setChunks((prevChunks) => [...prevChunks, e.data]);
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunks, {
            type: mediaRecorderRef.current?.mimeType,
          });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setChunks([]);
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setStartScrolling(true); // Start scrolling from beginning

        // Navigate to teleprompter screen
        setShowTeleprompter(true);
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert(
        'Error accessing media devices. Please check your camera and microphone permissions.'
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
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
      <h1 className="text-3xl font-bold mt-6">
        Teleprompter For Digital Creators
      </h1>
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
                {isRecording && (
                  <>
                    <div
                      className="absolute bottom-4 right-4 overflow-hidden bg-black rounded"
                      style={{
                        width: '150px',
                        height: '150px',
                        aspectRatio: selectedAspectRatio,
                      }}
                    >
                      <canvas ref={canvasRef} className="w-full h-full" />
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
