import React, { useRef } from "react";

const TeleprompterText: React.FC<{ isRecording: boolean }> = ({ isRecording }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div>
      <textarea
        ref={textAreaRef}
        className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        placeholder="Enter teleprompter text here..."
      />
    </div>
  );
};

export default TeleprompterText;
