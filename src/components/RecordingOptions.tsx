import React, { useState } from 'react';

const RecordingOptions = () => {
  const [recordingType, setRecordingType] = useState('camera');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h2 className="text-xl font-bold">Recording Options</h2>
        <div className="flex flex-col gap-2">
          <label>
            <input
              type="checkbox"
              checked={recordingType === 'camera'}
              onChange={() => setRecordingType('camera')}
            />
            Camera Only
          </label>
          <label>
            <input
              type="checkbox"
              checked={recordingType === 'screen'}
              onChange={() => setRecordingType('screen')}
            />
            Screen Only
          </label>
        </div>
        {recordingType === 'camera' && (
          <div className="mt-4">
            <label>Aspect Ratio:</label>
            <div className="flex gap-2">
              <label>
                <input
                  type="radio"
                  name="aspectRatio"
                  value="9:16"
                  checked={aspectRatio === '9:16'}
                  onChange={() => setAspectRatio('9:16')}
                />
                9:16 (Portrait)
              </label>
              <label>
                <input
                  type="radio"
                  name="aspectRatio"
                  value="16:9"
                  checked={aspectRatio === '16:9'}
                  onChange={() => setAspectRatio('16:9')}
                />
                16:9 (Landscape)
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="bg-gray-800 h-64 flex items-center justify-center">
        <p>Camera/Screen Preview</p>
      </div>
    </div>
  );
};

export default RecordingOptions;
