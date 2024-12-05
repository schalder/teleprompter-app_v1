import React, { useEffect, useState } from 'react';

const RecordingOptions: React.FC = () => {
  const [recordingType, setRecordingType] = useState<'camera' | 'screen'>('camera');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('16:9');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState<string>('');

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameraList = devices.filter((device) => device.kind === 'videoinput');
        const micList = devices.filter((device) => device.kind === 'audioinput');
        setCameras(cameraList);
        setMics(micList);
        if (cameraList.length > 0) setSelectedCamera(cameraList[0].deviceId);
        if (micList.length > 0) setSelectedMic(micList[0].deviceId);
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    };

    getDevices();
  }, []);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Start Recording</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div>
          {/* Recording Type */}
          <div className="mb-4">
            <label className="font-semibold">Choose what you want to record:</label>
            <div className="flex items-center mt-2">
              <input
                type="radio"
                id="camera"
                name="recordingType"
                value="camera"
                checked={recordingType === 'camera'}
                onChange={() => setRecordingType('camera')}
                className="mr-2"
              />
              <label htmlFor="camera" className="mr-4">Camera Only</label>
              <input
                type="radio"
                id="screen"
                name="recordingType"
                value="screen"
                checked={recordingType === 'screen'}
                onChange={() => setRecordingType('screen')}
                className="mr-2"
              />
              <label htmlFor="screen">Screen Only</label>
            </div>
          </div>

          {/* Camera Selection */}
          {recordingType === 'camera' && (
            <>
              <div className="mb-4">
                <label className="font-semibold">Select Camera:</label>
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full p-2 mt-2 bg-gray-800 text-white rounded"
                >
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label || `Camera ${camera.deviceId}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="mb-4">
                <label className="font-semibold">Video Aspect Ratio:</label>
                <div className="flex items-center mt-2">
                  <input
                    type="radio"
                    id="portrait"
                    name="aspectRatio"
                    value="9:16"
                    checked={aspectRatio === '9:16'}
                    onChange={() => setAspectRatio('9:16')}
                    className="mr-2"
                  />
                  <label htmlFor="portrait" className="mr-4">9:16 (Portrait)</label>
                  <input
                    type="radio"
                    id="landscape"
                    name="aspectRatio"
                    value="16:9"
                    checked={aspectRatio === '16:9'}
                    onChange={() => setAspectRatio('16:9')}
                    className="mr-2"
                  />
                  <label htmlFor="landscape">16:9 (Landscape)</label>
                </div>
              </div>
            </>
          )}

          {/* Microphone Selection */}
          <div className="mb-4">
            <label className="font-semibold">Select Microphone:</label>
            <select
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full p-2 mt-2 bg-gray-800 text-white rounded"
            >
              {mics.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${mic.deviceId}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="bg-gray-800 p-4 rounded-lg h-full flex items-center justify-center">
          <p>Camera/Screen Preview</p>
          {/* Implement camera or screen preview here */}
        </div>
      </div>
    </div>
  );
};

export default RecordingOptions;
