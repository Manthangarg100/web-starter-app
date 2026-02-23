/**
 * PhotoGrid - Displays photos in a grid with category badges
 * 
 * Shows locked status for memory-locked photos
 */

import { PhotoMetadata, PhotoCategory } from '../types/photo';
import { PrivacyScanner } from '../utils/PrivacyScanner';

interface PhotoGridProps {
  photos: PhotoMetadata[];
  onPhotoClick: (photo: PhotoMetadata) => void;
  selectedCategory?: PhotoCategory | 'all';
  onUnlockRequired?: (photo: PhotoMetadata) => void;
}

export function PhotoGrid({ 
  photos, 
  onPhotoClick, 
  selectedCategory = 'all',
  onUnlockRequired,
}: PhotoGridProps) {
  // Filter photos by selected category
  const filteredPhotos = selectedCategory === 'all' 
    ? photos
    : photos.filter(p => p.classification?.category === selectedCategory);

  const getCategoryBadge = (category: PhotoCategory) => {
    const badges = {
      [PhotoCategory.Document]: { emoji: '📄', label: 'Document', color: '#3b82f6' },
      [PhotoCategory.Receipt]: { emoji: '🧾', label: 'Receipt', color: '#10b981' },
      [PhotoCategory.Screenshot]: { emoji: '📱', label: 'Screenshot', color: '#8b5cf6' },
      [PhotoCategory.Note]: { emoji: '📝', label: 'Note', color: '#f59e0b' },
      [PhotoCategory.PersonalPhoto]: { emoji: '📷', label: 'Personal', color: '#ec4899' },
      [PhotoCategory.Unknown]: { emoji: '❓', label: 'Unknown', color: '#6b7280' },
    };

    return badges[category];
  };

  const handlePhotoClick = (photo: PhotoMetadata) => {
    // If photo is locked, trigger unlock flow instead
    if (photo.isLocked && photo.memoryLock?.enabled) {
      onUnlockRequired?.(photo);
    } else {
      onPhotoClick(photo);
    }
  };

  if (filteredPhotos.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No photos found</h3>
        <p>
          {selectedCategory === 'all' 
            ? 'Select images to get started'
            : `No ${selectedCategory} photos found`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {filteredPhotos.map((photo) => {
        const badge = photo.classification 
          ? getCategoryBadge(photo.classification.category)
          : null;
        
        const privacyColor = photo.privacyRisk 
          ? PrivacyScanner.getRiskLevelColor(photo.privacyRisk.level)
          : '#6b7280';

        const isLocked = photo.isLocked && photo.memoryLock?.enabled;

        return (
          <div 
            key={photo.id} 
            className={`photo-card ${isLocked ? 'locked' : ''}`}
            onClick={() => handlePhotoClick(photo)}
          >
            <div className="photo-image-container">
              <img 
                src={photo.dataUrl} 
                alt={photo.fileName}
                className={`photo-image ${isLocked ? 'blurred' : ''}`}
              />
              
              {/* Memory Lock Overlay */}
              {isLocked && (
                <div className="memory-lock-overlay">
                  <div className="lock-icon-large">🔐</div>
                  <p className="lock-text">Memory Locked</p>
                  <p className="lock-subtext">Click to unlock</p>
                </div>
              )}
              
              {badge && !isLocked && (
                <div 
                  className="photo-badge"
                  style={{ backgroundColor: badge.color }}
                >
                  <span className="badge-emoji">{badge.emoji}</span>
                  <span className="badge-label">{badge.label}</span>
                </div>
              )}

              {photo.privacyRisk && !isLocked && (
                <div 
                  className="privacy-indicator"
                  style={{ backgroundColor: privacyColor }}
                  title={`Privacy Risk: ${photo.privacyRisk.level.toUpperCase()}`}
                >
                  {PrivacyScanner.getRiskLevelIcon(photo.privacyRisk.level)}
                </div>
              )}

              {/* Lock indicator badge */}
              {isLocked && (
                <div className="lock-indicator-badge">
                  🧠 Memory Lock
                </div>
              )}
            </div>

            <div className="photo-info">
              <p className="photo-filename" title={photo.fileName}>
                {isLocked && '🔐 '}
                {photo.fileName}
              </p>
              {photo.classification && !isLocked && (
                <p className="photo-explanation">
                  {photo.classification.explanation.substring(0, 60)}
                  {photo.classification.explanation.length > 60 ? '...' : ''}
                </p>
              )}
              {isLocked && (
                <p className="photo-explanation locked-message">
                  Answer memory questions to unlock
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
