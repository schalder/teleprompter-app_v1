import React from "react";

const CameraPreview: React.FC<{ previewVideo: string }> = ({ previewVideo }) => {
  return (
    <div className="border border-gray-700 p-4 rounded-md">
      <video src={previewVideo} controls className="w-full h-auto" />
    </div>
  );
};

export default CameraPreview;
