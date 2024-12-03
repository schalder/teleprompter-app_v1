import React, { useState, useRef } from 'react';

interface TeleprompterProps {
  onStartRecording: () => void;
}

const Teleprompter: React.FC<TeleprompterProps> = ({ onStartRecording }) => {
  const [fontSize, setFontSize] = useState(24);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const [isScrolling, setIsScrolling] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const [scrollIntervalId, setScrollIntervalId] = useState<number | null>(null);

  const sampleText = `Your teleprompter text goes here...
  
  This is a sample text for testing the teleprompter functionality. You can replace this text with your own script. Adjust the font size and scroll speed using the controls above.`;

  const startScrolling = () => {
    setIsScrolling(true);
    const id = window.setInterval(() => {
      if (textRef.current) {
        textRef.current.scrollTop += scrollSpeed;
      }
    }, 50);
    setScrollIntervalId(id);
  };

  const stopScrolling = () => {
    setIsScrolling(false);
    if (scrollIntervalId !== null) {
      clearInterval(scrollIntervalId);
      setScrollIntervalId(null);
    }
  };

  const toggleScrolling = () => {
    if (isScrolling) {
      stopScrolling();
    } else {
      startScrolling();
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <span>Font Size:</span>
          <input
            type="range"
            min="16"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          />
          <span>{fontSize}px</span>
        </label>
        <label className="flex items-center space-x-2">
          <span>Scroll Speed:</span>
          <input
            type="range"
            min="1"
            max="10"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
          />
          <span>{scrollSpeed}</span>
        </label>
      </div>
      <div
        ref={textRef}
        className="w-full h-64 overflow-hidden border p-4 bg-white"
        style={{ fontSize: `${fontSize}px` }}
      >
        {sampleText}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={toggleScrolling}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isScrolling ? 'Pause' : 'Preview Scroll'}
        </button>
        <button
          onClick={onStartRecording}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Start Recording
        </button>
      </div>
    </div>
  );
};

export default Teleprompter;
