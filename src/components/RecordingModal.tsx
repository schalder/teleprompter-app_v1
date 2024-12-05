import React, { useEffect, useState } from 'react';

interface RecordingModalProps {
  onClose: () => void;
  onStart: (options: any) => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({
  onClose,
  onStart,
}) => {
  const [isCameraRecording, setIsCameraRecording] = useState(true);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>('');
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoPreviewStream, setVideoPreviewStream] = useState<MediaStream | null>(
    null
  );
  const videoPreviewRef = React.useRef<HTMLVideoElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions for camera and microphone
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        const audioInputs = devices.filter(
          (device) => device.kind === 'audioinput'
        );

        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);

        if (videoInputs.length > 0) {
          setSelectedVideoDevice(videoInputs[0].deviceId);
        }

        if (audioInputs.length > 0) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }

        console.log('Devices obtained:', { videoInputs, audioInputs });
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert(
          'Error accessing media devices. Please check your camera and microphone permissions.'
        );
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
      console.log('Screen stream obtained:', stream);
    } catch (error) {
      console.error('Error accessing screen for recording:', error);
      alert('Error accessing screen for recording. Please try again.');
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
        console.log('Screen stream stopped.');
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
        audio: false, // We handle audio separately
      };
      try {
        // Stop existing video preview stream
        if (videoPreviewStream) {
          videoPreviewStream.getTracks().forEach((track) => track.stop());
          setVideoPreviewStream(null);
          console.log('Previous video preview stream stopped.');
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setVideoPreviewStream(stream);
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
          // Adjust video element styling
          videoPreviewRef.current.style.objectFit = 'cover';
          videoPreviewRef.current.style.width = '100%';
          videoPreviewRef.current.style.height = '100%';
        }
        console.log('Video preview stream updated.');
      } catch (error) {
        console.error('Error updating camera preview:', error);
        alert(
          'Selected camera is not supported or not accessible. Please check permissions or try a different camera.'
        );
      }
    }
  };

  useEffect(() => {
    updatePreviewStream();

    // Cleanup on unmount
    return () => {
      if (videoPreviewStream) {
        videoPreviewStream.getTracks().forEach((track) => track.stop());
        console.log('Video preview stream cleaned up on unmount.');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideoDevice, aspectRatio]);

  const handleStart = () => {
    console.log('Start Recording button clicked in modal.');

    // Stop preview streams to release camera
    if (videoPreviewStream) {
      videoPreviewStream.getTracks().forEach((track) => track.stop());
      setVideoPreviewStream(null);
      console.log('Video preview stream stopped.');
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      console.log('Screen stream stopped.');
    }

    // Validate that devices are selected
    if (isCameraRecording && !selectedVideoDevice) {
      console.error('No video device selected.');
      alert('Please select a video device.');
      return;
    }
    if (!selectedAudioDevice) {
      console.error('No audio device selected.');
      alert('Please select an audio device.');
      return;
    }

    // Call onStart with selected options
    console.log('Calling onStart with options:', {
      isCameraRecording,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      aspectRatio,
    });
    onStart({
      isCameraRecording,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      aspectRatio,
    });

    // Close the modal
    onClose();
    console.log('Recording modal closed after starting recording.');
  };

  const handleVideoDeviceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const deviceId = e.target.value;
    setSelectedVideoDevice(deviceId);
    console.log('Video device changed to:', deviceId);
    // Request permission for the new device
    try {
      await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      console.log('Permission granted for selected camera.');
      updatePreviewStream();
    } catch (error) {
      console.error('Error accessing the selected camera.', error);
      alert('Permission denied for the selected camera. Please choose another one.');
    }
  };

  const handleAspectRatioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ratio = e.target.value;
    setAspectRatio(ratio);
    console.log('Aspect ratio changed to:', ratio);
  };

  const handleAudioDeviceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const deviceId = e.target.value;
    setSelectedAudioDevice(deviceId);
    console.log('Audio device changed to:', deviceId);
    // Request permission for the new audio device
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
      });
      console.log('Permission granted for selected microphone.');
    } catch (error) {
      console.error('Error accessing the selected microphone.', error);
      alert('Permission denied for the selected microphone. Please choose another one.');
    }
  };

  // Calculate preview dimensions
  const previewHeight = 250; // Fixed height
  const previewWidth =
    aspectRatio === '16:9'
      ? (previewHeight * 16) / 9
      : (previewHeight * 9) / 16;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-800 text-white p-6 rounded space-y-4 w-full max-w-lg">
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
            <div className="mt-4 flex justify-center">
              <div
                className="bg-black relative overflow-hidden"
                style={{
                  width: `${previewWidth}px`,
                  height: `${previewHeight}px`,
                }}
              >
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                ></video>
              </div>
            </div>
          </>
        )}
        {!isCameraRecording && (
          <div className="mt-4">
            <video
              ref={videoPreviewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-64 bg-black object-contain"
            ></video>
          </div>
        )}
        <div>
          <label className="block">Audio Device:</label>
          <select
            value={selectedAudioDevice}
            onChange={handleAudioDeviceChange}
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
          <button onClick={onClose} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Start Recording
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingModal;
