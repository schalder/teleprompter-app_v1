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
  const [fontSize, setFontSize] = useState(32);
  const [scrollSpeed, setScrollSpeed] = useState(9);
  const [isScrolling, setIsScrolling] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const [textContent, setTextContent] = useState(`Your teleprompter text goes here...`);

  // Start scrolling when 'startScrolling' becomes true
  useEffect(() => {
    if (startScrolling) {
      // Reset scroll position to top
      if (textRef.current) {
        textRef.current.scrollTop = 0;
      }
      // Start scrolling
      startScrollingText();
      // Reset 'startScrolling' to prevent repeated triggers
      setStartScrolling(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startScrolling]);

  // Stop scrolling when recording stops
  useEffect(() => {
    if (!isRecording) {
      stopScrolling();
    }
  }, [isRecording]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current !== null) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  const startScrollingText = () => {
    setIsScrolling(true);
    // Clear any existing interval
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
    }
    const id = window.setInterval(() => {
      if (textRef.current) {
        textRef.current.scrollTop += scrollSpeed / 9;
        // Check if reached the bottom
        if (
          textRef.current.scrollTop + textRef.current.clientHeight >=
          textRef.current.scrollHeight
        ) {
          clearInterval(id);
          scrollIntervalRef.current = null;
          setIsScrolling(false);
          // Optionally reset scroll position to top
          textRef.current.scrollTop = 0;
        }
      }
    }, 50);
    scrollIntervalRef.current = id;
  };

  const stopScrolling = () => {
    setIsScrolling(false);
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const handlePreviewScroll = () => {
    // Reset scroll position
    if (textRef.current) {
      textRef.current.scrollTop = 0;
    }
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
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
        className="w-full h-96 overflow-hidden p-4 bg-gray-800 rounded"
        style={{
          fontSize: `${fontSize}px`,
          whiteSpace: 'pre-wrap', // Preserve whitespace and line breaks
        }}
      >
        {textContent}
      </div>
      <textarea
        className="w-full h-32 p-2 bg-gray-800 text-white rounded border border-gray-700"
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
        {!isRecording && (
          <button
            onClick={onStartRecording}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Start Recording
          </button>
        )}
      </div>
    </div>
  );
};

export default Teleprompter;
