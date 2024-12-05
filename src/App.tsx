import React, { useState, useRef, useEffect } from 'react';
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
  const chunksRef = useRef<BlobPart[]>([]);
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [startScrolling, setStartScrolling] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');

  // Handle starting the recording process
  const handleStartRecording = () => {
    setShowModal(true);
  };

  // Handle closing the modal
  const handleModalClose = () => {
    setShowModal(false);
  };

  // Handle the initiation of recording with selected options
  const handleRecordingStart = async (options: any) => {
    setShowModal(false);
    setIsCameraRecording(options.isCameraRecording);
    setSelectedAspectRatio(options.aspectRatio);

    try {
      let stream: MediaStream;

      if (options.isCameraRecording) {
        const aspectRatioValue = options.aspectRatio === '16:9' ? 16 / 9 : 9 / 16;
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: options.videoDeviceId
              ? { exact: options.videoDeviceId }
              : undefined,
            aspectRatio: { ideal: aspectRatioValue },
            frameRate: { ideal: 30 },
          },
          audio: options.audioDeviceId
            ? { deviceId: { exact: options.audioDeviceId } }
            : true,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } else {
        // Screen recording
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();

          const videoWidth = videoRef.current!.videoWidth;
          const videoHeight = videoRef.current!.videoHeight;
          const videoAspectRatio = videoWidth / videoHeight;

          // Set canvas dimensions based on selected aspect ratio
          let canvasWidth = 1280;
          let canvasHeight = 720;
          if (options.aspectRatio === '16:9') {
            canvasWidth = 1280;
            canvasHeight = 720;
          } else if (options.aspectRatio === '9:16') {
            canvasWidth = 720;
            canvasHeight = 1280;
          }

          if (canvasRef.current) {
            canvasRef.current.width = canvasWidth;
            canvasRef.current.height = canvasHeight;
          }

          // Start drawing video to canvas
          const drawToCanvas = () => {
            if (canvasRef.current && videoRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                let sx = 0,
                  sy = 0,
                  sw = videoWidth,
                  sh = videoHeight;
                let dx = 0,
                  dy = 0,
                  dw = canvasWidth,
                  dh = canvasHeight;

                const canvasAspectRatio = canvasWidth / canvasHeight;

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
            chunksRef.current.push(e.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, {
              type: mediaRecorderRef.current?.mimeType,
            });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            chunksRef.current = []; // Reset chunks

            // Stop the original stream
            stream.getTracks().forEach((track) => track.stop());
          };
          mediaRecorderRef.current.start();
          setIsRecording(true);
          setStartScrolling(true); // Start scrolling text

          // Navigate to teleprompter screen
          setShowTeleprompter(true);
        };
      }
    };

    const handleStopRecording = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
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
                          aspectRatio: selectedAspectRatio.replace(':', '/'),
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
    ```

    **Key Changes:**

    - **Fixed Modal Size:** Ensured that the modal has a fixed size regardless of the selected aspect ratio.
    - **Proper State Management:** Used `chunksRef` to handle data chunks correctly and reset them after re
