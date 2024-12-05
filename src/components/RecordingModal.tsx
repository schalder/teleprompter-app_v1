import React, { useEffect, useState } from 'react';

interface RecordingModalProps {
  onClose: () => void;
  onStart: (options: any) => void;
}

const RecordingModal: React.FC<RecordingModalProps> = ({
  onClose,
  onStart,
}) => {
  // ... [existing state variables and useEffects]

  const handleStart = () => {
    console.log('Start Recording button clicked in modal.');
    // Stop preview streams to release camera
    if (videoPreviewStream) {
      videoPreviewStream.getTracks().forEach((track) => track.stop());
      setVideoPreviewStream(null);
      console.log('Video preview stream stopped.');
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      console.log('Screen stream stopped.');
    }

    // Call onStart with selected options
    console.log('Calling onStart with options:', {
      isCameraRecording,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      aspectRatio,
    });
    onStart({
      isCameraRecording,
      videoDeviceId: selectedVideoDevice,
      audioDeviceId: selectedAudioDevice,
      aspectRatio,
    });

    // Close the modal
    onClose();
  };

  // ... [rest of the code]
};

export default RecordingModal;
