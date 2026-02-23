/**
 * FolderSelector - Component for selecting and importing image folders
 * 
 * Allows users to select multiple images from their device for classification
 */

import { useRef } from 'react';

interface FolderSelectorProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

export function FolderSelector({ onFilesSelected, isProcessing }: FolderSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Filter for image files only
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      alert('No valid image files selected. Please select JPG, PNG, or other image formats.');
      return;
    }

    onFilesSelected(imageFiles);
    
    // Reset input so same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="folder-selector">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="selector-content">
        <div className="selector-icon">
          📁
        </div>
        <h2>Smart Photo Organizer</h2>
        <p className="selector-subtitle">
          100% On-Device • Privacy-First • Fully Offline
        </p>
        <button
          className="btn-primary btn-large"
          onClick={handleClick}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Select Images to Organize'}
        </button>
        <p className="selector-note">
          All AI processing happens locally on your device. No data is uploaded to any server.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🏷️</div>
          <h3>Auto-Classification</h3>
          <p>Documents, receipts, screenshots, notes, and personal photos</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">💡</div>
          <h3>Explainable AI</h3>
          <p>Understand why each photo was classified</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Privacy Scanner</h3>
          <p>Detect sensitive documents and personal information</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Smart Search</h3>
          <p>Natural language queries like "receipts from last month"</p>
        </div>
      </div>
    </div>
  );
}
