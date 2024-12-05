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
  const [textContent, setTextContent] = useState(`Your teleprompter text goes here...`);

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
          console.log('Reached the end of the text.');
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
      console.log('Scrolling stopped.');
    }
  };

  const handlePreviewScroll = () => {
    console.log('Preview scroll started.');
    // Reset scroll position
    if (textRef.current) {
      textRef.current.scrollTop = 0;
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

  return (
    // ... [existing JSX]
  );
};

export default Teleprompter;
