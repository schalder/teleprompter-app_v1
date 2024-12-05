import React, { useEffect, useRef } from 'react';

interface TeleprompterProps {
  onStartRecording: () => void;
  isRecording: boolean;
  isCameraRecording: boolean;
  startScrolling: boolean;
  setStartScrolling: (value: boolean) => void;
}

const Teleprompter: React.FC<TeleprompterProps> = ({
  onStartRecording,
  isRecording,
  isCameraRecording,
  startScrolling,
  setStartScrolling,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const sampleText = `
    Welcome to your teleprompter application. This text will scroll as you record your video.
    Ensure that you maintain eye contact with the camera for a more engaging presentation.
    Remember to speak clearly and at a steady pace.
    This is an example of how the teleprompter works with your recording.
    Good luck with your recording session!
  `;

  useEffect(() => {
    if (isRecording && startScrolling) {
      // Reset scroll position to top
      if (textRef.current) {
        textRef.current.scrollTop = 0;
      }

      // Start scrolling
      scrollIntervalRef.current = setInterval(() => {
        if (textRef.current) {
          textRef.current.scrollTop += 1;
          // Stop scrolling when bottom is reached
          if (
            textRef.current.scrollTop + textRef.current.clientHeight >=
            textRef.current.scrollHeight
          ) {
            if (scrollIntervalRef.current) {
              clearInterval(scrollIntervalRef.current);
              scrollIntervalRef.current = null;
            }
            setStartScrolling(false);
          }
        }
      }, 20); // Adjust the speed as needed
    } else {
      // Stop scrolling
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording, startScrolling]);

  return (
    <div className="flex flex-col space-y-4">
      <div
        ref={textRef}
        className="flex-1 p-4 bg-gray-700 text-white text-lg rounded overflow-auto"
        style={{ height: '300px' }} // Fixed height for consistency
      >
        {sampleText}
      </div>
      <button
        onClick={() => {
          onStartRecording();
          setStartScrolling(true); // Start scrolling from beginning
        }}
        className={`px-4 py-2 bg-green-500 text-white rounded ${
          isRecording ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
        }`}
        disabled={isRecording}
      >
        Start Recording
      </button>
    </div>
  );
};

export default Teleprompter;
