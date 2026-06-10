import { useState, useCallback } from 'react';
import { processImageFile } from '../../utils/projectHelpers';

/**
 * Admin tab for managing the hero section profile photo.
 * The photo URL is persisted to Firestore `settings/profile` by the parent.
 */
export function ProfileTab({ currentPhoto, onSavePhoto, showNotification }) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    try {
      const { objectUrl } = await processImageFile(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
    } catch (err) {
      console.error('Error processing image:', err);
      showNotification?.('Error processing image. Please try a different image.', 'error');
    }
  }, [showNotification]);

  const handleImageUpload = useCallback((e) => {
    handleFile(e.target.files[0]);
  }, [handleFile]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setIsDragging(false); }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    } else {
      showNotification?.('Please drop an image file', 'error');
    }
  }, [handleFile, showNotification]);

  const handleSave = async () => {
    if (!selectedFile && !previewUrl) {
      showNotification?.('Please select an image first', 'error');
      return;
    }

    setIsSaving(true);

    // Convert file to base64 data URL for Firestore storage
    const reader = new FileReader();
    reader.onloadend = async () => {
      const success = await onSavePhoto(reader.result);
      setIsSaving(false);
      if (success) {
        showNotification?.('Profile photo updated successfully!');
        setPreviewUrl('');
        setSelectedFile(null);
      } else {
        showNotification?.('Failed to save profile photo', 'error');
      }
    };
    reader.onerror = () => {
      setIsSaving(false);
      showNotification?.('Error reading image file.', 'error');
    };

    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
    } else if (previewUrl) {
      // If only a preview URL exists (no new file), save the existing URL
      const success = await onSavePhoto(previewUrl);
      setIsSaving(false);
      if (success) {
        showNotification?.('Profile photo updated successfully!');
      } else {
        showNotification?.('Failed to save profile photo', 'error');
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Remove profile photo and revert to default?')) return;
    setIsSaving(true);
    const success = await onSavePhoto(null);
    setIsSaving(false);
    if (success) {
      setPreviewUrl('');
      setSelectedFile(null);
      showNotification?.('Profile photo removed. Default will be used.', 'warning');
    } else {
      showNotification?.('Failed to remove profile photo', 'error');
    }
  };

  const handleCancel = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setSelectedFile(null);
  };

  const displayPhoto = previewUrl || currentPhoto;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Photo Preview */}
      <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-6 border border-gray-700/50">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          Hero Section Profile Photo
        </h3>
        <p className="text-sm text-gray-400 mb-6">
          This photo appears in the hero section of your portfolio. Upload a new image to replace it.
        </p>

        {/* Photo Display */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-purple-500 shadow-lg shadow-purple-500/20">
              {displayPhoto ? (
                <img
                  src={displayPhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            {currentPhoto && !previewUrl && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Current
              </div>
            )}
            {previewUrl && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div
            className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-300 mb-2">Drag and drop your profile photo here, or</p>
            <label className="inline-block px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg cursor-pointer text-sm font-medium transition-all shadow-md shadow-purple-600/20">
              Choose File
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG, WebP. Recommended: square image, at least 400x400px.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full justify-center">
            {previewUrl && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium flex items-center gap-2 shadow-md shadow-green-600/20 transition-all"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Save Photo
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
            {currentPhoto && !previewUrl && (
              <button
                onClick={handleRemovePhoto}
                disabled={isSaving}
                className="px-5 py-2.5 bg-gray-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-300 disabled:opacity-50 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-gray-600 hover:border-red-500/50"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Remove Photo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-blue-500/20">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm text-blue-300 font-medium">How it works</p>
            <p className="text-xs text-gray-400 mt-1">
              Your profile photo is stored in Firestore and synced in real-time.
              Changes will appear immediately on the hero section of your portfolio.
              If no custom photo is set, the default image will be used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
