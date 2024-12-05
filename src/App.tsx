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

    // Start the recording process
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
        console.log('Requesting user media with constraints:', constraints);
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('User media obtained:', stream);
      } else {
        // Screen recording code...
        console.log('Requesting screen media...');
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: options.audioDeviceId
            ? { deviceId: { exact: options.audioDeviceId } }
            : true,
        });
        console.log('Screen media obtained:', stream);
      }

      // Proceed to set up the recording
      await setupRecording(stream, options.aspectRatio);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      alert(
        'Error accessing media devices. Please check your camera and microphone permissions.'
      );
    }
  };

 const setupRecording = async (stream: MediaStream, aspectRatio: string) => {
  console.log('Setting up recording...');
  try {
    // Set up the video element and canvas for recording
    if (videoRef.current) {
      videoRef.current.srcObject = stream;

      // Wait for the video metadata to be loaded
      await new Promise<void>((resolve) => {
        videoRef.current!.onloadedmetadata = () => {
          resolve();
        };
      });

      await videoRef.current.play(); // Ensure the video is playing
      console.log('Video element is playing.');

      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      const videoAspectRatio = videoWidth / videoHeight;
      console.log('Video dimensions:', { videoWidth, videoHeight });

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
      console.log('Started drawing video to canvas.');

      // Get canvas stream for recording
      const canvasStream = canvasRef.current?.captureStream(30);
      console.log('Canvas stream captured:', canvasStream);

      // Combine canvas stream with audio if available
      if (stream.getAudioTracks().length > 0 && canvasStream) {
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => canvasStream?.addTrack(track));
        console.log('Audio tracks added to canvas stream.');
      } else {
        console.warn('No audio tracks to add to canvas stream.');
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

      if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
        alert('MediaRecorder is not supported in your browser.');
        console.error('MediaRecorder is not supported.');
        return;
      }

      try {
        mediaRecorderRef.current = new MediaRecorder(
          canvasStream as MediaStream,
          optionsForRecorder
        );
        setVideoMimeType(mediaRecorderRef.current.mimeType);
        console.log('MediaRecorder created:', mediaRecorderRef.current);
      } catch (e) {
        console.error('Failed to create MediaRecorder:', e);
        alert('Failed to start recording. Please try again.');
        return;
      }

      mediaRecorderRef.current.ondataavailable = (e) => {
        console.log('Data available:', e.data);
        setChunks((prevChunks) => [...prevChunks, e.data]);
      };

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

      mediaRecorderRef.current.start(100); // Collect data every 100ms
      console.log('MediaRecorder started. State:', mediaRecorderRef.current.state);

      // Update state to indicate recording has started
      setIsRecording(true);
      setStartScrolling(true); // Start scrolling from beginning
      console.log(
        'Recording state updated: isRecording = true, startScrolling = true'
      );
    }
  } catch (error) {
    console.error('Error during setupRecording:', error);
    alert('An error occurred while setting up the recording.');
  }
};

  const handleStopRecording = () => {
    console.log('Stopping recording...');
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
    console.log(
      'Recording state updated: isRecording = false, startScrolling = false'
    );
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
