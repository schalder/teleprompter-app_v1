// src/App.tsx
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
  const [showTeleprompter, setShowTeleprompter] = useState(true);
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [startScrolling, setStartScrolling] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');
  const [recordingError, setRecordingError] = useState<string>('');

  // Handle device changes for camera switching
  useEffect(() => {
    const handleDeviceChange = () => {
      if (isRecording && isCameraRecording) {
        alert('Camera device changed. Please restart the recording.');
        handleStopRecording();
      }
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [isRecording, isCameraRecording]);

  const handleStartRecording = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleRecordingStart = async (options: any) => {
    setShowModal(false);
    setIsCameraRecording(options.isCameraRecording);
    setSelectedAspectRatio(options.aspectRatio);
    setRecordingError('');

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

                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
            setIsRecording(false);
            setStartScrolling(false);
            chunks.length = 0; // Clear chunks
          };
          mediaRecorderRef.current.onerror = (event) => {
            console.error('MediaRecorder error:', event.error);
            setRecordingError(`Recording error: ${event.error.name}`);
            setIsRecording(false);
            setStartScrolling(false);
          };
          mediaRecorderRef.current.start();
          setIsRecording(true);
          setStartScrolling(true); // Start scrolling from beginning

          // Navigate to teleprompter screen and reset teleprompter scroll
          setShowTeleprompter(true);
        };
      } catch (err: any) {
        console.error('Error accessing media devices.', err);
        setRecordingError(
          'Error accessing media devices. Your camera may not support the selected aspect ratio.'
        );
      }
    };

    const handleStopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
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
                        className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
                      >
                        Stop Recording
                      </button>
                    </>
                  )}
                  {isRecording && !isCameraRecording && (
                    <button
                      onClick={handleStopRecording}
                      className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded"
                    >
                      Stop Recording
                    </button>
                  )}
                </div>
              )}
              {showModal && (
                <RecordingModal onClose={handleModalClose} onStart={handleRecordingStart} />
              )}
              {recordingError && (
                <div className="mt-4 p-4 bg-red-600 text-white rounded">
                  {recordingError}
                </div>
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

    **Explanation of Changes:**

    - **Fixed Modal Positioning:**
      - Changed the "Stop Recording" button's positioning to be absolute within the teleprompter area, ensuring it doesn't appear at the top of the app.
    
    - **Error Handling:**
      - Added a `recordingError` state to capture and display errors during the recording process.
    
    - **Camera Switching Detection:**
      - Implemented an event listener for `devicechange` to detect when the camera is switched during recording. If detected, it stops the recording and alerts the user.
    
    - **Teleprompter Scroll Reset:**
      - Ensured that when recording starts, the teleprompter scrolls from the beginning by resetting `scrollTop` to `0`.

    - **Start Recording Button Functionality:**
      - Adjusted the `Teleprompter` component to trigger scrolling and start recording correctly when "Start Recording" is clicked.

### **B. `src/components/RecordingModal.tsx`**

```tsx
// src/components/RecordingModal.tsx
import React, { useEffect, useState } from 'react';

interface RecordingModalProps {
  onClose: () => void;
  onStart: (options: any) => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({ onClose, onStart }) => {
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoPreviewStream, setVideoPreviewStream] = useState<MediaStream | null>(null);
  const videoPreviewRef = React.useRef<HTMLVideoElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [modalHeight, setModalHeight] = useState('auto');

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === 'videoinput');
        const audioInputs = devices.filter((device) => device.kind === 'audioinput');

        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);

        if (videoInputs.length > 0) {
          setSelectedVideoDevice(videoInputs[0].deviceId);
        }

        if (audioInputs.length > 0) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }
      } catch (error) {
        console.error('Error accessing media devices.', error);
        alert('Error accessing media devices. Please check your camera and microphone permissions.');
      }
    };

    getDevices();
  }, []);

  const handleScreenRecordingSelection = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      setScreenStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing screen for recording:', error);
      alert('Error accessing screen for recording.');
    }
  };

  useEffect(() => {
    if (!isCameraRecording) {
      handleScreenRecordingSelection();
    } else {
      // Stop screen stream if any
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
    }
    // Cleanup on unmount
    return () => {
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraRecording]);

  const updatePreviewStream = async () => {
    if (selectedVideoDevice && isCameraRecording) {
      const aspectRatioValue = aspectRatio === '16:9' ? 16 / 9 : 9 / 16;
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: selectedVideoDevice },
          aspectRatio: { ideal: aspectRatioValue },
          frameRate: { ideal: 30 },
        },
        audio: false,
      };
      try {
        // Stop existing video preview stream
        if (videoPreviewStream) {
          videoPreviewStream.getTracks().forEach((track) => track.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setVideoPreviewStream(stream);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          videoPreviewRef.current.onloadedmetadata = () => {
            videoPreviewRef.current?.play();
          };
        }

        // Adjust modal height based on aspect ratio
        setModalHeight(aspectRatio === '16:9' ? 'auto' : 'auto'); // Can set fixed height if needed
      } catch (error) {
        console.error('Error updating camera preview:', error);
        alert('Selected camera is not supported or not accessible. Please check permissions.');
      }
    }
  };

  useEffect(() => {
    updatePreviewStream();

    // Cleanup on unmount
    return () => {
      if (videoPreviewStream) {
        videoPreviewStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideoDevice, aspectRatio]);

  const handleStart = () => {
    if (videoPreviewStream) {
      videoPreviewStream.getTracks().forEach((track) => track.stop());
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
    }
    onStart({
      isCameraRecording,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      aspectRatio,
    });
  };

  const handleVideoDeviceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVideoDevice(e.target.value);
    // Request permission for the new device
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: e.target.value } },
      });
    } catch (error) {
      console.error('Error accessing the selected camera.', error);
      alert('Permission denied for the selected camera.');
    }
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAspectRatio(e.target.value);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      style={{ overflowY: 'auto' }} // Ensure scroll if content overflows
    >
      <div
        className="bg-gray-800 text-white p-6 rounded space-y-4 w-full max-w-lg"
        style={{ maxHeight: '90vh' }} // Prevent modal from exceeding viewport height
      >
        <h2 className="text-xl font-bold">Recording Options</h2>
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="recordingType"
              checked={isCameraRecording}
              onChange={() => setIsCameraRecording(true)}
            />
            <span>Camera Recording</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="recordingType"
              checked={!isCameraRecording}
              onChange={() => setIsCameraRecording(false)}
            />
            <span>Screen Recording</span>
          </label>
        </div>
        {isCameraRecording && (
          <>
            <div>
              <label className="block">Video Device:</label>
              <select
                value={selectedVideoDevice}
                onChange={handleVideoDeviceChange}
                className="w-full border p-2 bg-gray-700 text-white rounded"
              >
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block">Aspect Ratio:</label>
              <select
                value={aspectRatio}
                onChange={handleAspectRatioChange}
                className="w-full border p-2 bg-gray-700 text-white rounded"
              >
                <option value="16:9">Landscape (16:9)</option>
                <option value="9:16">Portrait (9:16)</option>
              </select>
            </div>
            <div className="mt-4">
              <div
                className="w-full bg-black relative overflow-hidden rounded"
                style={{
                  aspectRatio: aspectRatio.replace(':', '/'),
                  height: '200px', // Fixed height to prevent modal expansion
                }}
              >
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  className="absolute inset-0 w-full h-full object-cover rounded"
                ></video>
              </div>
            </div>
          </>
        )}
        {!isCameraRecording && (
          <div className="mt-4">
            <div
              className="w-full bg-black relative overflow-hidden rounded"
              style={{
                aspectRatio: '16/9', // Default for screen recording
                height: '200px',
              }}
            >
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                className="absolute inset-0 w-full h-full object-contain rounded"
              ></video>
            </div>
          </div>
        )}
        <div>
          <label className="block">Audio Device:</label>
          <select
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
            className="w-full border p-2 bg-gray-700 text-white rounded"
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Microphone ${device.deviceId}`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Start Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingModal;
