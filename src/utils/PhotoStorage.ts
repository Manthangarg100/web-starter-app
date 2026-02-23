/**
 * PhotoStorage - IndexedDB storage for photo metadata
 * 
 * Stores all photo metadata locally for offline access and fast searching
 * Includes memory lock management
 */

import { PhotoMetadata, PhotoCategory, PrivacyRiskLevel, MemoryQuestion } from '../types/photo';

const DB_NAME = 'PhotoOrganizerDB';
const DB_VERSION = 2; // Increment version for memory lock support
const STORE_NAME = 'photos';

export class PhotoStorage {
  private static db: IDBDatabase | null = null;

  /**
   * Initialize the IndexedDB database
   */
  static async initialize(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(new Error('Failed to open database'));
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          
          // Create indexes for efficient querying
          store.createIndex('fileName', 'fileName', { unique: false });
          store.createIndex('category', 'classification.category', { unique: false });
          store.createIndex('privacyLevel', 'privacyRisk.level', { unique: false });
          store.createIndex('dateAdded', 'dateAdded', { unique: false });
        }
      };
    });
  }

  /**
   * Save a photo to storage
   */
  static async savePhoto(photo: PhotoMetadata): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(photo);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save photo'));
    });
  }

  /**
   * Get a photo by ID
   */
  static async getPhoto(id: string): Promise<PhotoMetadata | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result as PhotoMetadata | undefined;
        resolve(result || null);
      };
      request.onerror = () => reject(new Error('Failed to get photo'));
    });
  }

  /**
   * Get all photos
   */
  static async getAllPhotos(): Promise<PhotoMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const photos = request.result as PhotoMetadata[];
        // Sort by date added (newest first)
        photos.sort((a, b) => 
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        resolve(photos);
      };
      request.onerror = () => reject(new Error('Failed to get photos'));
    });
  }

  /**
   * Get photos by category
   */
  static async getPhotosByCategory(category: PhotoCategory): Promise<PhotoMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => {
        const photos = request.result as PhotoMetadata[];
        photos.sort((a, b) => 
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        resolve(photos);
      };
      request.onerror = () => reject(new Error('Failed to get photos by category'));
    });
  }

  /**
   * Get photos by privacy level
   */
  static async getPhotosByPrivacyLevel(level: PrivacyRiskLevel): Promise<PhotoMetadata[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('privacyLevel');
      const request = index.getAll(level);

      request.onsuccess = () => {
        const photos = request.result as PhotoMetadata[];
        photos.sort((a, b) => 
          new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
        );
        resolve(photos);
      };
      request.onerror = () => reject(new Error('Failed to get photos by privacy level'));
    });
  }

  /**
   * Search photos by text query (searches in fileName, classification explanation, and textContent)
   */
  static async searchPhotos(query: string): Promise<PhotoMetadata[]> {
    const allPhotos = await this.getAllPhotos();
    const lowerQuery = query.toLowerCase();

    return allPhotos.filter(photo => {
      // Search in filename
      if (photo.fileName.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in classification explanation
      if (photo.classification?.explanation.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in category
      if (photo.classification?.category.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in detected privacy elements
      if (photo.privacyRisk?.detectedElements.some(elem => 
        elem.toLowerCase().includes(lowerQuery)
      )) {
        return true;
      }

      // Search in text content (OCR)
      if (photo.textContent?.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Delete a photo
   */
  static async deletePhoto(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete photo'));
    });
  }

  /**
   * Clear all photos
   */
  static async clearAll(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear photos'));
    });
  }

  /**
   * Get storage statistics
   */
  static async getStats(): Promise<{
    total: number;
    byCategory: Record<PhotoCategory, number>;
    byPrivacyLevel: Record<PrivacyRiskLevel, number>;
    lockedPhotos: number;
  }> {
    const allPhotos = await this.getAllPhotos();

    const stats = {
      total: allPhotos.length,
      byCategory: {
        [PhotoCategory.Document]: 0,
        [PhotoCategory.Receipt]: 0,
        [PhotoCategory.Screenshot]: 0,
        [PhotoCategory.Note]: 0,
        [PhotoCategory.PersonalPhoto]: 0,
        [PhotoCategory.Unknown]: 0,
      },
      byPrivacyLevel: {
        [PrivacyRiskLevel.High]: 0,
        [PrivacyRiskLevel.Medium]: 0,
        [PrivacyRiskLevel.Low]: 0,
      },
      lockedPhotos: 0,
    };

    for (const photo of allPhotos) {
      if (photo.classification) {
        stats.byCategory[photo.classification.category]++;
      }
      if (photo.privacyRisk) {
        stats.byPrivacyLevel[photo.privacyRisk.level]++;
      }
      if (photo.isLocked) {
        stats.lockedPhotos++;
      }
    }

    return stats;
  }

  /**
   * Enable memory lock for a photo
   */
  static async enableMemoryLock(
    photoId: string,
    questions: MemoryQuestion[]
  ): Promise<void> {
    const photo = await this.getPhoto(photoId);
    if (!photo) throw new Error('Photo not found');

    photo.memoryLock = {
      enabled: true,
      questions,
      createdAt: new Date(),
      failedAttempts: 0,
    };
    photo.isLocked = true;

    await this.savePhoto(photo);
  }

  /**
   * Disable memory lock for a photo
   */
  static async disableMemoryLock(photoId: string): Promise<void> {
    const photo = await this.getPhoto(photoId);
    if (!photo) throw new Error('Photo not found');

    photo.memoryLock = undefined;
    photo.isLocked = false;

    await this.savePhoto(photo);
  }

  /**
   * Unlock a photo (temporarily)
   */
  static async unlockPhoto(photoId: string): Promise<void> {
    const photo = await this.getPhoto(photoId);
    if (!photo) throw new Error('Photo not found');

    photo.isLocked = false;

    await this.savePhoto(photo);
  }

  /**
   * Lock a photo again
   */
  static async lockPhoto(photoId: string): Promise<void> {
    const photo = await this.getPhoto(photoId);
    if (!photo) throw new Error('Photo not found');

    if (photo.memoryLock?.enabled) {
      photo.isLocked = true;
      await this.savePhoto(photo);
    }
  }

  /**
   * Increment failed unlock attempts
   */
  static async incrementFailedAttempts(photoId: string): Promise<void> {
    const photo = await this.getPhoto(photoId);
    if (!photo || !photo.memoryLock) return;

    photo.memoryLock.failedAttempts++;
    await this.savePhoto(photo);
  }

  /**
   * Get all locked photos
   */
  static async getLockedPhotos(): Promise<PhotoMetadata[]> {
    const allPhotos = await this.getAllPhotos();
    return allPhotos.filter(p => p.isLocked && p.memoryLock?.enabled);
  }
}

