/**
 * PhotoOrganizer - Main component for Smart Personal Photo Organizer
 * 
 * Integrates:
 * - Folder selection
 * - On-device AI classification
 * - Privacy scanning
 * - Search and filtering
 * - Photo detail view
 * - Digital Memory Lock (Privacy-first authentication)
 */

import { useState, useEffect } from 'react';
import { ModelManager, VLMWorkerBridge } from '../runanywhere';
import { PhotoMetadata, PhotoCategory, ClassificationProgress, MemoryQuestion } from '../types/photo';
import { PhotoClassifier } from '../utils/PhotoClassifier';
import { ExplainableAI } from '../utils/ExplainableAI';
import { PrivacyScanner } from '../utils/PrivacyScanner';
import { PhotoStorage } from '../utils/PhotoStorage';
import { FolderSelector } from './FolderSelector';
import { ProgressIndicator } from './ProgressIndicator';
import { SearchBar } from './SearchBar';
import { PhotoGrid } from './PhotoGrid';
import { PhotoDetailModal } from './PhotoDetailModal';
import { UnlockPromptModal } from './UnlockPromptModal';

type ViewState = 'empty' | 'loading-model' | 'processing' | 'photos';

export function PhotoOrganizer() {
  const [viewState, setViewState] = useState<ViewState>('empty');
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoMetadata[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null);
  const [progress, setProgress] = useState<ClassificationProgress | null>(null);
  const [modelReady, setModelReady] = useState(false);
  
  // Memory Lock states
  const [photoToUnlock, setPhotoToUnlock] = useState<PhotoMetadata | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Initialize storage and load existing photos
  useEffect(() => {
    const init = async () => {
      await PhotoStorage.initialize();
      const existingPhotos = await PhotoStorage.getAllPhotos();
      if (existingPhotos.length > 0) {
        setPhotos(existingPhotos);
        setFilteredPhotos(existingPhotos);
        setViewState('photos');
      }
    };
    init();
  }, []);

  // Update filtered photos when category changes
  useEffect(() => {
    setFilteredPhotos(photos);
  }, [photos]);

  /**
   * Load VLM model for classification
   */
  const loadModel = async () => {
    try {
      setViewState('loading-model');
      
      // Download and load VLM model
      const modelId = 'lfm2-vl-450m-q4_0';
      
      // Download and load the model
      console.log('Downloading and loading VLM model...');
      await ModelManager.downloadModel(modelId);
      await ModelManager.loadModel(modelId);
      
      setModelReady(true);
      return true;
    } catch (error) {
      console.error('Failed to load model:', error);
      alert('Failed to load AI model. Please refresh and try again.');
      setViewState('empty');
      return false;
    }
  };

  /**
   * Handle file selection and start classification
   */
  const handleFilesSelected = async (files: File[]) => {
    // Load model if not ready
    if (!modelReady) {
      const loaded = await loadModel();
      if (!loaded) return;
    }

    setViewState('processing');
    
    const newPhotos: PhotoMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      setProgress({
        total: files.length,
        current: i + 1,
        currentFile: file.name,
      });

      try {
        // Convert image to data URL for storage
        const dataUrl = await fileToDataUrl(file);
        
        // Convert to RGB pixels for VLM
        const { rgbPixels, width, height } = await PhotoClassifier.imageToRGB(file);

        // Classify the image
        const classification = await PhotoClassifier.classifyImage(
          rgbPixels,
          width,
          height
        );

        // Scan for privacy risks
        const privacyRisk = await PrivacyScanner.scanImage(
          rgbPixels,
          width,
          height,
          classification.category
        );

        // Create metadata
        const photo: PhotoMetadata = {
          id: `photo-${Date.now()}-${i}`,
          fileName: file.name,
          fileSize: file.size,
          dateAdded: new Date(),
          dataUrl,
          classification,
          privacyRisk,
          imageWidth: width,
          imageHeight: height,
        };

        // Save to storage
        await PhotoStorage.savePhoto(photo);
        newPhotos.push(photo);

      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    // Update state
    const allPhotos = [...photos, ...newPhotos];
    setPhotos(allPhotos);
    setFilteredPhotos(allPhotos);
    setProgress(null);
    setViewState('photos');
  };

  /**
   * Handle search
   */
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setFilteredPhotos(photos);
      return;
    }

    const results = await PhotoStorage.searchPhotos(query);
    setFilteredPhotos(results);
  };

  /**
   * Handle category filter
   */
  const handleCategoryFilter = (category: PhotoCategory | 'all') => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredPhotos(photos);
    } else {
      setFilteredPhotos(photos.filter(p => p.classification?.category === category));
    }
  };

  /**
   * Handle photo click
   */
  const handlePhotoClick = (photo: PhotoMetadata) => {
    setSelectedPhoto(photo);
  };

  /**
   * Handle unlock required - triggered when clicking locked photo
   */
  const handleUnlockRequired = (photo: PhotoMetadata) => {
    setPhotoToUnlock(photo);
    setShowUnlockModal(true);
  };

  /**
   * Handle successful unlock
   */
  const handleUnlockSuccess = async () => {
    if (!photoToUnlock) return;
    
    // Unlock the photo
    await PhotoStorage.unlockPhoto(photoToUnlock.id);
    
    // Refresh photos
    const updatedPhotos = await PhotoStorage.getAllPhotos();
    setPhotos(updatedPhotos);
    setFilteredPhotos(updatedPhotos);
    
    setShowUnlockModal(false);
    
    // Show the photo detail
    const unlockedPhoto = updatedPhotos.find(p => p.id === photoToUnlock.id);
    if (unlockedPhoto) {
      setSelectedPhoto(unlockedPhoto);
    }
    
    setPhotoToUnlock(null);
  };

  /**
   * Handle failed unlock
   */
  const handleUnlockFailed = async () => {
    if (!photoToUnlock) return;
    
    // Increment failed attempts
    await PhotoStorage.incrementFailedAttempts(photoToUnlock.id);
    
    // Refresh photos to show updated failed count
    const updatedPhotos = await PhotoStorage.getAllPhotos();
    setPhotos(updatedPhotos);
    setFilteredPhotos(updatedPhotos);
    
    setShowUnlockModal(false);
    setPhotoToUnlock(null);
  };

  /**
   * Handle memory lock enabled
   */
  const handleMemoryLockEnabled = async (photoId: string, questions: MemoryQuestion[]) => {
    await PhotoStorage.enableMemoryLock(photoId, questions);
    
    // Refresh photos
    const updatedPhotos = await PhotoStorage.getAllPhotos();
    setPhotos(updatedPhotos);
    setFilteredPhotos(updatedPhotos);
    
    // Update selected photo if it's still open
    if (selectedPhoto?.id === photoId) {
      const updated = updatedPhotos.find(p => p.id === photoId);
      if (updated) setSelectedPhoto(updated);
    }
  };

  /**
   * Handle memory lock disabled
   */
  const handleMemoryLockDisabled = async (photoId: string) => {
    await PhotoStorage.disableMemoryLock(photoId);
    
    // Refresh photos
    const updatedPhotos = await PhotoStorage.getAllPhotos();
    setPhotos(updatedPhotos);
    setFilteredPhotos(updatedPhotos);
    
    // Update selected photo if it's still open
    if (selectedPhoto?.id === photoId) {
      const updated = updatedPhotos.find(p => p.id === photoId);
      if (updated) setSelectedPhoto(updated);
    }
  };

  /**
   * Handle clear all
   */
  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to delete all photos? This cannot be undone.')) {
      return;
    }
    
    await PhotoStorage.clearAll();
    setPhotos([]);
    setFilteredPhotos([]);
    setViewState('empty');
  };

  /**
   * Convert file to data URL
   */
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="photo-organizer">
      {viewState === 'loading-model' && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="spinner" />
            <h2>Loading AI Model...</h2>
            <p>Downloading and initializing on-device vision model</p>
            <p className="loading-note">
              This is a one-time download (~500MB). The model will be cached for future use.
            </p>
          </div>
        </div>
      )}

      {viewState === 'processing' && progress && (
        <div className="loading-overlay">
          <div className="loading-content">
            <ProgressIndicator progress={progress} />
          </div>
        </div>
      )}

      {viewState === 'empty' && (
        <FolderSelector 
          onFilesSelected={handleFilesSelected}
          isProcessing={false}
        />
      )}

      {viewState === 'photos' && (
        <>
          <div className="organizer-header">
            <div className="header-title">
              <h1>📷 Smart Photo Organizer</h1>
              <p className="header-subtitle">
                Privacy-first • On-device AI • Fully offline
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.multiple = true;
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files) handleFilesSelected(Array.from(files));
                  };
                  input.click();
                }}
              >
                ➕ Add More Photos
              </button>
              {photos.length > 0 && (
                <button 
                  className="btn-danger"
                  onClick={handleClearAll}
                >
                  🗑️ Clear All
                </button>
              )}
            </div>
          </div>

          <SearchBar
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            selectedCategory={selectedCategory}
            photoCount={filteredPhotos.length}
          />

          <PhotoGrid
            photos={filteredPhotos}
            onPhotoClick={handlePhotoClick}
            onUnlockRequired={handleUnlockRequired}
            selectedCategory={selectedCategory}
          />
        </>
      )}

      {selectedPhoto && (
        <PhotoDetailModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onMemoryLockEnabled={handleMemoryLockEnabled}
          onMemoryLockDisabled={handleMemoryLockDisabled}
        />
      )}

      {showUnlockModal && photoToUnlock && photoToUnlock.memoryLock && (
        <UnlockPromptModal
          questions={photoToUnlock.memoryLock.questions}
          fileName={photoToUnlock.fileName}
          failedAttempts={photoToUnlock.memoryLock.failedAttempts}
          onUnlock={handleUnlockSuccess}
          onFailed={handleUnlockFailed}
          onClose={() => {
            setShowUnlockModal(false);
            setPhotoToUnlock(null);
          }}
        />
      )}
    </div>
  );
}
