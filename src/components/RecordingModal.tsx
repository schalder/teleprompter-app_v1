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
  const [resolution, setResolution] = useState('1920x1080');

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setVideoDevices(devices.filter((device) => device.kind === 'videoinput'));
      setAudioDevices(devices.filter((device) => device.kind === 'audioinput'));
    });
  }, []);

  const handleStart = () => {
    onStart({
      isCameraRecording,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      resolution,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded space-y-4 w-96">
        <h2 className="text-xl font-bold">Recording Options</h2>
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isCameraRecording}
              onChange={() => setIsCameraRecording(!isCameraRecording)}
            />
            <span>Camera Recording</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!isCameraRecording}
              onChange={() => setIsCameraRecording(!isCameraRecording)}
            />
            <span>Screen Recording</span>
          </label>
        </div>
        <div>
          <label>Video Device:</label>
          <select
            value={selectedVideoDevice}
            onChange={(e) => setSelectedVideoDevice(e.target.value)}
            className="w-full border p-2"
          >
            {videoDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || 'Unknown Camera'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Audio Device:</label>
          <select
            value={selectedAudioDevice}
            onChange={(e) => setSelectedAudioDevice(e.target.value)}
            className="w-full border p-2"
          >
            {audioDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || 'Unknown Microphone'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Resolution:</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="w-full border p-2"
          >
            <option value="1920x1080">1920x1080 (Landscape)</option>
            <option value="1080x1920">1080x1920 (Portrait)</option>
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
