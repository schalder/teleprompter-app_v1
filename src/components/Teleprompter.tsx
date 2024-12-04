import React, { useState, useRef, useEffect } from 'react';

interface TeleprompterProps {
  onStartRecording: () => void;
  isRecording: boolean;
  isCameraRecording: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  startScrolling: boolean;
  setStartScrolling: React.Dispatch<React.SetStateAction<boolean>>;
}

const Teleprompter: React.FC<TeleprompterProps> = ({
  onStartRecording,
  isRecording,
  isCameraRecording,
  videoRef,
  startScrolling,
  setStartScrolling,
}) => {
  const [fontSize, setFontSize] = useState(24);
  const [scrollSpeed, setScrollSpeed] = useState(8);
  const [isScrolling, setIsScrolling] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const [scrollIntervalId, setScrollIntervalId] = useState<number | null>(null);
  const [textContent, setTextContent] = useState(`Your teleprompter text goes here...`);

  useEffect(() => {
    if (startScrolling) {
      // Reset scroll position
      if (textRef.current) {
        textRef.current.scrollTop = 0;
      }
      startScrollingText();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startScrolling]);

  useEffect(() => {
    return () => {
      if (scrollIntervalId !== null) {
        clearInterval(scrollIntervalId);
      }
    };
  }, [scrollIntervalId]);

  const startScrollingText = () => {
    setIsScrolling(true);
    const id = window.setInterval(() => {
      if (textRef.current) {
        textRef.current.scrollTop += scrollSpeed;
        // Check if reached the bottom
        if (
          textRef.current.scrollTop + textRef.current.clientHeight >=
          textRef.current.scrollHeight
        ) {
          clearInterval(id);
          setIsScrolling(false);
          setStartScrolling(false);
          // Reset scroll position to top
          textRef.current.scrollTop = 0;
        }
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

  const handlePreviewScroll = () => {
    // Reset scroll position
    if (textRef.current) {
      textRef.current.scrollTop = 0;
    }
    if (scrollIntervalId !== null) {
      clearInterval(scrollIntervalId);
    }
    startScrollingText();
  };

  const handlePlayPause = () => {
    if (isScrolling) {
      stopScrolling();
    } else {
      startScrollingText();
    }
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4 bg-gray-800 text-white rounded-lg max-w-full">
      <div
        ref={textRef}
        className="w-full h-64 overflow-hidden border p-4 bg-gray-700 rounded"
        style={{ fontSize: `${fontSize}px` }}
      >
        {textContent}
      </div>
      <textarea
        className="w-full h-32 p-2 bg-gray-700 text-white rounded border border-gray-600"
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Enter your text here..."
      ></textarea>
      <div className="flex flex-wrap justify-center space-x-4">
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
            max="20"
            value={scrollSpeed}
            onChange={(e) => setScrollSpeed(Number(e.target.value))}
          />
          <span>{scrollSpeed}</span>
        </label>
      </div>
      <div className="flex flex-wrap justify-center space-x-4">
        {!isRecording && (
          <>
            <button
              onClick={handlePreviewScroll}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Preview Scroll
            </button>
            <button
              onClick={handlePlayPause}
              className="px-4 py-2 bg-green-500 text-white rounded"
            >
              {isScrolling ? 'Pause' : 'Play'}
            </button>
          </>
        )}
        {isRecording && (
          <button
            onClick={handlePlayPause}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {isScrolling ? 'Pause' : 'Play'}
          </button>
        )}
        <button
          onClick={onStartRecording}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Start Recording
        </button>
      </div>
    </div>
  );
};

export default Teleprompter;
