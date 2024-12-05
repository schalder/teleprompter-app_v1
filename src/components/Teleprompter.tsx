import React, { useState, useRef, useEffect } from 'react';

interface TeleprompterProps {
  onStartRecording: () => void;
  isRecording: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  startScrolling: boolean;
  setStartScrolling: React.Dispatch<React.SetStateAction<boolean>>;
}

const Teleprompter: React.FC<TeleprompterProps> = ({
  onStartRecording,
  isRecording,
  videoRef,
  startScrolling,
  setStartScrolling,
}) => {
  const [fontSize, setFontSize] = useState(32);
  const [scrollSpeed, setScrollSpeed] = useState(9);
  const [isScrolling, setIsScrolling] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);
  const [textContent, setTextContent] = useState(
    `Your teleprompter text goes here...`
  );

  useEffect(() => {
    if (startScrolling) {
      console.log('startScrolling is true, starting scrolling...');
      // Reset scroll position to top
      if (textRef.current) {
        textRef.current.scrollTop = 0;
        console.log('Scroll position reset to top.');
      }
      // Start scrolling
      startScrollingText();
      // Reset 'startScrolling' to prevent repeated triggers
      setStartScrolling(false);
      console.log('startScrolling state reset to false.');
    }
  }, [startScrolling, setStartScrolling]);

  useEffect(() => {
    if (!isRecording) {
      console.log('Recording stopped, stopping scrolling...');
      stopScrolling();
    }
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (scrollIntervalRef.current !== null) {
        clearInterval(scrollIntervalRef.current);
        console.log('Scroll interval cleared on unmount.');
      }
    };
  }, []);

  const startScrollingText = () => {
    setIsScrolling(true);
    console.log('Starting text scrolling...');
    // Clear any existing interval
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
      console.log('Existing scroll interval cleared.');
    }
    const id = window.setInterval(() => {
      if (textRef.current) {
        textRef.current.scrollTop += scrollSpeed / 9;
        console.log(
          `Scrolling... Current scrollTop: ${textRef.current.scrollTop}`
        );
        // Check if reached the bottom
        if (
          textRef.current.scrollTop + textRef.current.clientHeight >=
          textRef.current.scrollHeight
        ) {
          clearInterval(id);
          scrollIntervalRef.current = null;
          setIsScrolling(false);
          console.log('Reached the end of the text.');
          // Optionally reset scroll position to top
          textRef.current.scrollTop = 0;
          console.log('Scroll position reset to top after reaching the end.');
        }
      } else {
        console.warn('textRef.current is null during scrolling.');
      }
    }, 50);
    scrollIntervalRef.current = id;
    console.log('Scroll interval set with ID:', id);
  };

  const stopScrolling = () => {
    setIsScrolling(false);
    if (scrollIntervalRef.current !== null) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
      console.log('Scrolling stopped and interval cleared.');
    }
  };

  const handlePreviewScroll = () => {
    console.log('Preview scroll started.');
    // Reset scroll position
    if (textRef.current) {
      textRef.current.scrollTop = 0;
      console.log('Scroll position reset to top for preview.');
    }
    startScrollingText();
  };

  const handlePlayPause = () => {
    if (isScrolling) {
      console.log('Pausing scrolling.');
      stopScrolling();
    } else {
      console.log('Resuming scrolling.');
      startScrollingText();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(e.target.value);
    console.log('Teleprompter text updated.');
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = Number(e.target.value);
    if (isNaN(size) || size < 16 || size > 72) {
      alert('Font size must be between 16 and 72.');
      console.warn('Invalid font size input:', size);
      return;
    }
    setFontSize(size);
    console.log('Font size changed to:', size);
  };

  const handleScrollSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = Number(e.target.value);
    if (isNaN(speed) || speed < 1 || speed > 20) {
      alert('Scroll speed must be between 1 and 20.');
      console.warn('Invalid scroll speed input:', speed);
      return;
    }
    setScrollSpeed(speed);
    console.log('Scroll speed changed to:', speed);
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
        onChange={handleTextChange}
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
            onChange={handleFontSizeChange}
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
            onChange={handleScrollSpeedChange}
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
            <button
              onClick={onStartRecording}
              className="px-4 py-2 bg-purple-500 text-white rounded"
            >
              Start Recording
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
      </div>
    </div>
  );
};

export default Teleprompter;
