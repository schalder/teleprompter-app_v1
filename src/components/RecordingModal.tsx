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
  const [resolution, setResolution] = useState('1920x1080');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [videoPreviewStream, setVideoPreviewStream] = useState<MediaStream | null>(
    null
  );
  const videoPreviewRef = React.useRef<HTMLVideoElement>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getDevices = async () => {
      try {
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
      } catch (error) {
        console.error('Error accessing media devices.', error);
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
    } catch (error) {
      console.error('Error accessing screen for recording:', error);
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
      const [previewWidth, previewHeight] = resolution
        .split('x')
        .map(Number);
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: { exact: selectedVideoDevice },
          width: { ideal: previewWidth },
          height: { ideal: previewHeight },
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
          // Adjust video element styling
          videoPreviewRef.current.style.objectFit = 'cover';
          videoPreviewRef.current.style.width = '100%';
          videoPreviewRef.current.style.height = '100%';
        }
      } catch (error) {
        console.error('Error updating camera preview:', error);
        alert(
          'Selected camera is not supported or not accessible. Please check permissions.'
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
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVideoDevice, resolution]);

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
      resolution,
      aspectRatio,
    });
  };

  const handleVideoDeviceChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
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

  const handleResolutionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResolution(e.target.value);
    setAspectRatio(e.target.value === '1920x1080' ? '16:9' : '9:16');
  };

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
              <label className="block">Resolution:</label>
              <select
                value={resolution}
                onChange={handleResolutionChange}
                className="w-full border p-2 bg-gray-700 text-white rounded"
              >
                <option value="1920x1080">1920x1080 (Landscape)</option>
                <option value="1080x1920">1080x1920 (Portrait)</option>
              </select>
            </div>
            <div className="mt-4">
              <div
                className="w-full bg-black relative overflow-hidden"
                style={{ aspectRatio: aspectRatio }}
              >
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
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
              className="w-full h-64 bg-black object-contain"
            ></video>
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
