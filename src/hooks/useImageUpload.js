import { useState, useCallback } from 'react';
import { processImageFile } from '../utils/projectHelpers';

/**
 * Reusable image upload hook.
 * Handles file selection, drag-and-drop, compression, and preview URL lifecycle.
 */
export function useImageUpload({ onError } = {}) {
  const [newImage, setNewImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleImageFile = useCallback(
    async (file) => {
      if (!file) return;
      try {
        // Revoke previous URL
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const { imageToUse, objectUrl } = await processImageFile(file);
        setPreviewUrl(objectUrl);
        setNewImage(imageToUse);
      } catch (err) {
        console.error('Error processing image:', err);
        onError?.('Error processing image. Please try a different image.');
      }
    },
    [previewUrl, onError],
  );

  const handleImageUpload = useCallback(
    (e) => {
      handleImageFile(e.target.files[0]);
    },
    [handleImageFile],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
      } else {
        onError?.('Please drop an image file');
      }
    },
    [handleImageFile, onError],
  );

  const clearImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setNewImage(null);
  }, [previewUrl]);

  const setPreviewOnly = useCallback((url) => {
    setPreviewUrl(url);
    setNewImage(null);
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return {
    newImage,
    previewUrl,
    isDragging,
    handleImageUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearImage,
    setPreviewOnly,
    setNewImage,
    cleanup,
  };
}
