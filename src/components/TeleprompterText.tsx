import React, { useState } from 'react';

const TeleprompterText = () => {
  const [text, setText] = useState('Welcome to the teleprompter app!');
  const [fontSize, setFontSize] = useState(24);
  const [scrollSpeed, setScrollSpeed] = useState(50);

  return (
    <div>
      <textarea
        className="w-full bg-gray-800 text-white p-2 mb-4"
        rows={10}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-4 mb-4">
        <div>
          <label>Font Size:</label>
          <input
            type="range"
            min="16"
            max="48"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Scroll Speed:</label>
          <input
            type="range"
            min="10"
            max="100"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
};

export default TeleprompterText;
