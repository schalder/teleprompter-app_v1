import React, { useRef } from 'react';

interface ScrollPreviewProps {
  text: string;
  fontSize: number;
  scrollSpeed: number;
}

const ScrollPreview: React.FC<ScrollPreviewProps> = ({ text, fontSize, scrollSpeed }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePreview = () => {
    if (previewRef.current) {
      previewRef.current.scrollTop = 0;
      const totalHeight = previewRef.current.scrollHeight;
      const duration = (totalHeight / scrollSpeed) * 1000;

      previewRef.current.style.transition = `scroll-top ${duration}ms linear`;
      previewRef.current.scrollTop = totalHeight;

      // Reset after animation
      setTimeout(() => {
        if (previewRef.current) {
          previewRef.current.scrollTop = 0;
          previewRef.current.style.transition = 'none';
        }
      }, duration);
    }
  };

  return (
    <div className="mb-6">
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={handlePreview}
      >
        Scroll Preview
      </button>
      <div
        ref={previewRef}
        className="w-full h-40 overflow-auto bg-gray-800 p-4 rounded-lg"
        style={{ fontSize: `${fontSize}px` }}
      >
        {text.split('\n').map((line, index) => (
          <p key={index} className="mb-2">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default ScrollPreview;
