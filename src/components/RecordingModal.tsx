import React, { useRef, useEffect, useState } from 'react';

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
  const [text, setText] = useState('Your teleprompter text goes here...');
  const [scrollSpeed, setScrollSpeed] = useState(50);
  const textRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollIntervalId, setScrollIntervalId] = useState<number | null>(null);

  useEffect(() => {
    if (startScrolling && !scrollIntervalId) {
      // Reset scroll position to top
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }

      // Start scrolling
      const intervalId = window.setInterval(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += 1;
        }
      }, scrollSpeed);
      setScrollIntervalId(intervalId);
    }

    // Stop scrolling when recording stops
    if (!startScrolling && scrollIntervalId) {
      clearInterval(scrollIntervalId);
      setScrollIntervalId(null);
    }

    return () => {
      if (scrollIntervalId) {
        clearInterval(scrollIntervalId);
        setScrollIntervalId(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startScrolling]);

  const handleStartRecording = () => {
    onStartRecording();
  };

  return (
    <div className="flex flex-col items-center">
      {!isRecording && (
        <button
          onClick={handleStartRecording}
          className="px-4 py-2 bg-blue-500 text-white rounded mb-4"
        >
          Start Recording
        </button>
      )}
      <div
        ref={scrollContainerRef}
        className="w-full h-96 overflow-hidden bg-black text-white text-2xl p-4"
      >
        <div ref={textRef}>
          {text.split('\n').map((line, index) => (
            <p key={index} className="mb-4">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Teleprompter;
