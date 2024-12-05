import React from 'react';

interface ControlsProps {
  fontSize: number;
  setFontSize: React.Dispatch<React.SetStateAction<number>>;
  scrollSpeed: number;
  setScrollSpeed: React.Dispatch<React.SetStateAction<number>>;
}

const Controls: React.FC<ControlsProps> = ({
  fontSize,
  setFontSize,
  scrollSpeed,
  setScrollSpeed,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
      <div className="flex items-center mb-4 md:mb-0">
        <label className="mr-2 font-semibold">Font Size:</label>
        <input
          type="range"
          min="16"
          max="48"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="slider"
        />
        <span className="ml-2">{fontSize}px</span>
      </div>
      <div className="flex items-center">
        <label className="mr-2 font-semibold">Scroll Speed:</label>
        <input
          type="range"
          min="10"
          max="100"
          value={scrollSpeed}
          onChange={(e) => setScrollSpeed(Number(e.target.value))}
          className="slider"
        />
        <span className="ml-2">{scrollSpeed}</span>
      </div>
    </div>
  );
};

export default Controls;
