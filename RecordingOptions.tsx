import React, { useEffect, useState } from 'react';

interface RecordingOptionsProps {
  onStartRecording: (constraints: MediaStreamConstraints) => void;
}

const RecordingOptions: React.FC<RecordingOptionsProps> = ({
  onStartRecording,
}) => {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [resolution, setResolution] = useState('1920x1080');

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(
          (device) => device.kind === 'videoinput'
        );
        setVideoDevices(videoInputDevices);
        if (videoInputDevices.length > 0) {
          setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error accessing media devices.', err);
        alert('Please allow camera access.');
      }
    };

    getDevices();
  }, []);

  const handleStart = () => {
    const [width, height] = resolution.split('x').map(Number);
    const constraints: MediaStreamConstraints = {
      video: {
        deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
        width: { ideal: width },
        height: { ideal: height },
      },
      audio: true,
    };
    onStartRecording(constraints);
  };

  return (
    <div>
      <h2>Recording Options</h2>
      <div>
        <label>Camera:</label>
        <select
          value={selectedDeviceId}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || 'Unnamed Device'}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Resolution:</label>
        <select
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
        >
          <option value="1920x1080">1920x1080 (Landscape)</option>
          <option value="1080x1920">1080x1920 (Portrait)</option>
        </select>
      </div>
      <button onClick={handleStart}>Start Recording</button>
    </div>
  );
};

export default RecordingOptions;
