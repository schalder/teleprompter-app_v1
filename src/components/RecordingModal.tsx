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
  const [previewAspectRatio, setPreviewAspectRatio] = useState('16:9');
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
        setModalHeight(aspectRatio === '16:9' ? 'auto' : 'auto'); // Adjust as needed
        setPreviewAspectRatio(aspectRatio);
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
        className="bg-gray-800 text-white p-6 rounded max-h-full overflow-y-auto"
        style={{ width: '90%', maxWidth: '500px' }}
      >
        <h2 className="text-xl font-bold mb-4">Recording Options</h2>
        <div className="flex flex-col space-y-4">
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
                <label className="block mb-1">Video Device:</label>
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
                <label className="block mb-1">Aspect Ratio:</label>
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
                    aspectRatio: previewAspectRatio.replace(':', '/'),
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
            <label className="block mb-1">Audio Device:</label>
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
          <div className="flex justify-end space-x-4 mt-4">
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
    </div>
  );
};

export default RecordingModal;
