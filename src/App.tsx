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
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [startScrolling, setStartScrolling] = useState(false);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('16:9');

  const handleStartRecording = () => {
    console.log('Opening recording modal...');
    setShowModal(true);
  };

  const handleModalClose = () => {
    console.log('Closing recording modal...');
    setShowModal(false);
  };

  const handleRecordingStart = async (options: any) => {
    console.log('Recording options received:', options);

    // Ensure the modal is closed
    setShowModal(false);

    // Update state with recording options
    setIsCameraRecording(options.isCameraRecording);
    setSelectedAspectRatio(options.aspectRatio);

    // Validate audioDeviceId
    if (!options.audioDeviceId) {
      console.error('No audio device selected.');
      alert('Please select an audio device.');
      return;
    }

    // Validate videoDeviceId
    if (options.isCameraRecording && !options.videoDeviceId) {
      console.error('No video device selected.');
      alert('Please select a video device.');
      return;
    }

    // Start the recording process
    try {
      let stream: MediaStream;

      if (options.isCameraRecording) {
        const aspectRatioValue = options.aspectRatio === '16:9' ? 16 / 9 : 9 / 16;
        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: options.videoDeviceId },
            aspectRatio: { ideal: aspectRatioValue },
            frameRate: { ideal: 30 },
          },
          audio: { deviceId: { exact: options.audioDeviceId } },
        };
        console.log('Requesting user media with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('User media obtained:', stream);
      } else {
        // Screen recording code (Not implemented)
        console.error('Screen recording is not implemented.');
        alert('Screen recording is not implemented yet.');
        return;
      }

      // Proceed to set up the recording
      await setupRecording(stream, options.aspectRatio);
    } catch (err) {
      console.error('Error accessing media devices:', err);
      alert('Error accessing media devices. Please check your permissions.');
    }
  };

  const setupRecording = async (stream: MediaStream, aspectRatio: string) => {
    console.log('Setting up recording...');
    try {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for the video metadata to load
        await new Promise<void>((resolve, reject) => {
          const video = videoRef.current!;
          const handleLoadedMetadata = () => {
            console.log('Video metadata loaded.');
            resolve();
          };
          const handleError = (e: any) => {
            console.error('Error loading video metadata:', e);
            reject(e);
          };
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('error', handleError);
        });

        // Play the video
        console.log('Calling play on video element...');
        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video is playing.');
            })
            .catch((error) => {
              console.error('Error playing video:', error);
              alert('Error playing video.');
            });
        }

        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;
        const videoAspectRatio = videoWidth / videoHeight;
        console.log('Video dimensions:', { videoWidth, videoHeight });

        if (videoWidth === 0 || videoHeight === 0) {
          throw new Error('Video dimensions are zero.');
        }

        // Set canvas dimensions based on selected aspect ratio
        let canvasWidth = 1280;
        let canvasHeight = 720;
        if (aspectRatio === '16:9') {
          canvasWidth = 1280;
          canvasHeight = 720;
        } else if (aspectRatio === '9:16') {
          canvasWidth = 720;
          canvasHeight = 1280;
        }

        if (canvasRef.current) {
          canvasRef.current.width = canvasWidth;
          canvasRef.current.height = canvasHeight;
          console.log('Canvas dimensions set:', { canvasWidth, canvasHeight });
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
        console.log('Started drawing to canvas.');

        // Get canvas stream for recording
        const canvasStream = canvasRef.current?.captureStream(30);
        if (!canvasStream) {
          throw new Error('Failed to capture canvas stream.');
        }
        console.log('Canvas stream captured:', canvasStream);

        // Combine canvas stream with audio if available
        if (stream.getAudioTracks().length > 0) {
          const audioTracks = stream.getAudioTracks();
          audioTracks.forEach((track) => {
            canvasStream.addTrack(track);
            console.log('Added audio track to canvas stream:', track);
          });
        } else {
          console.warn('No audio tracks found in the stream.');
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
        console.log('MediaRecorder options:', optionsForRecorder);

        // Create MediaRecorder
        mediaRecorderRef.current = new MediaRecorder(
          canvasStream,
          optionsForRecorder
        );
        if (!mediaRecorderRef.current) {
          throw new Error('Failed to create MediaRecorder.');
        }
        setVideoMimeType(mediaRecorderRef.current.mimeType);
        console.log('MediaRecorder created:', mediaRecorderRef.current);

        // Handle data available
        mediaRecorderRef.current.ondataavailable = (e) => {
          console.log('Data available:', e.data);
          setChunks((prevChunks) => [...prevChunks, e.data]);
        };

        // Handle stop event
        mediaRecorderRef.current.onstop = () => {
          console.log('Recording stopped.');
          const blob = new Blob(chunks, {
            type: mediaRecorderRef.current?.mimeType,
          });
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setChunks([]); // Clear chunks
          console.log('Video URL created:', url);
        };

        // Start the recorder
        mediaRecorderRef.current.start(100); // Collect data every 100ms
        console.log('MediaRecorder started.');

        // Update state to indicate recording has started
        setIsRecording(true);
        setStartScrolling(true); // Start scrolling from beginning
        console.log('Recording state updated: isRecording = true, startScrolling = true');
      };

  const handleStopRecording = () => {
    console.log('Stopping recording...');
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log('MediaRecorder stopped.');
      } else {
        console.warn('MediaRecorder is already inactive.');
      }

      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
        console.log('Video tracks stopped.');
      }

      setIsRecording(false);
      setStartScrolling(false);
      console.log('Recording state updated: isRecording = false, startScrolling = false');
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert('An error occurred while stopping the recording.');
    }
  };

  const handleRecordAgain = () => {
    console.log('Preparing to record again...');
    setVideoUrl('');
    setIsRecording(false);
    setStartScrolling(false); // Reset scrolling
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      <h1 className="text-3xl font-bold mt-6">
        Teleprompter For Digital Creators
      </h1>
      <div className="w-full max-w-[900px] p-4">
        {!videoUrl ? (
          <>
            <div className="relative">
              <Teleprompter
                onStartRecording={handleStartRecording}
                isRecording={isRecording}
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
            </div>
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
