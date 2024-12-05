import React from 'react';

interface TeleprompterTextProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}

const TeleprompterText: React.FC<TeleprompterTextProps> = ({ text, setText }) => {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Teleprompter Text</label>
      <textarea
        className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={6}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your teleprompter text here..."
      ></textarea>
    </div>
  );
};

export default TeleprompterText;
