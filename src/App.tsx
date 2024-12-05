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
  const chunks: BlobPart[] = [];
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [startScrolling, setStartScrolling] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1920x1080');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');

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
      let stream: MediaStream;

      const [width, height] = options.resolution.split('x').map(Number);

      if (options.isCameraRecording) {
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: options.videoDeviceId
              ? { exact: options.videoDeviceId }
              : undefined,
            width: { ideal: width },
            height: { ideal: height },
            frameRate: { ideal: 30 },
          },
          audio: options.audioDeviceId
            ? { deviceId: { exact: options.audioDeviceId } }
            : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // Screen recording code...
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();

          // Set canvas dimensions
          if (canvasRef.current) {
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          }

          // Start drawing video to canvas
          const drawToCanvas = () => {
            if (canvasRef.current && videoRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                const videoWidth = videoRef.current.videoWidth;
                const videoHeight = videoRef.current.videoHeight;
                const videoAspectRatio = videoWidth / videoHeight;
                const canvasAspectRatio = width / height;

                let sx = 0,
                  sy = 0,
                  sw = videoWidth,
                  sh = videoHeight;
                let dx = 0,
                  dy = 0,
                  dw = width,
                  dh = height;

                if (videoAspectRatio > canvasAspectRatio) {
                  // Video is wider than canvas, crop the sides
                  const newSw = videoHeight * canvasAspectRatio;
                  sx = (videoWidth - newSw) / 2;
                  sw = newSw;
                } else if (videoAspectRatio < canvasAspectRatio) {
                  // Video is taller than canvas, crop the top and bottom
                  const newSh = videoWidth / canvasAspectRatio;
                  sy = (videoHeight - newSh) / 2;
                  sh = newSh;
                }

                ctx.drawImage(
                  videoRef.current,
                  sx,
                  sy,
                  sw,
                  sh,
                  dx,
                  dy,
                  dw,
                  dh
                );
              }
            }
            requestAnimationFrame(drawToCanvas);
          };

          drawToCanvas();

          // Get canvas stream for recording
          const canvasStream = canvasRef.current?.captureStream(30);

          // Combine canvas stream with audio if available
          if (stream.getAudioTracks().length > 0 && canvasStream) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach((track) => canvasStream?.addTrack(track));
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
            canvasStream as MediaStream,
            optionsForRecorder
          );
          setVideoMimeType(mediaRecorderRef.current.mimeType);

          mediaRecorderRef.current.ondataavailable = (e) => {
            chunks.push(e.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunks, {
              type: mediaRecorderRef.current?.mimeType,
            });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
          };
          mediaRecorderRef.current.start();
          setIsRecording(true);
          setStartScrolling(true); // Start scrolling from beginning

          // Navigate to teleprompter screen
          setShowTeleprompter(true);
        };
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert(
        'Error accessing media devices. Your camera may not support the selected resolution and aspect ratio.'
      );
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
                {isRecording && isCameraRecording && (
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
