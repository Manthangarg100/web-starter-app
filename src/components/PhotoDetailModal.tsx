/**
 * PhotoDetailModal - Shows detailed information about a photo
 * 
 * Displays:
 * - Full image
 * - Classification with explanation
 * - Privacy risk score and details
 * - Digital Memory Lock control (for high-risk photos)
 */

import { useState } from 'react';
import { PhotoMetadata, PhotoCategory, MemoryQuestion } from '../types/photo';
import { PrivacyScanner } from '../utils/PrivacyScanner';
import { MemoryLockGenerator } from '../utils/MemoryLockGenerator';
import { MemoryLockModal } from './MemoryLockModal';

interface PhotoDetailModalProps {
  photo: PhotoMetadata;
  onClose: () => void;
  onMemoryLockEnabled?: (photoId: string, questions: MemoryQuestion[]) => void;
  onMemoryLockDisabled?: (photoId: string) => void;
}

export function PhotoDetailModal({ 
  photo, 
  onClose,
  onMemoryLockEnabled,
  onMemoryLockDisabled,
}: PhotoDetailModalProps) {
  const [showMemoryLockModal, setShowMemoryLockModal] = useState(false);
  const getCategoryInfo = (category: PhotoCategory) => {
    const info = {
      [PhotoCategory.Document]: { emoji: '📄', label: 'Document', color: '#3b82f6' },
      [PhotoCategory.Receipt]: { emoji: '🧾', label: 'Receipt', color: '#10b981' },
      [PhotoCategory.Screenshot]: { emoji: '📱', label: 'Screenshot', color: '#8b5cf6' },
      [PhotoCategory.Note]: { emoji: '📝', label: 'Note', color: '#f59e0b' },
      [PhotoCategory.PersonalPhoto]: { emoji: '📷', label: 'Personal Photo', color: '#ec4899' },
      [PhotoCategory.Unknown]: { emoji: '❓', label: 'Unknown', color: '#6b7280' },
    };
    return info[category];
  };

  const categoryInfo = photo.classification 
    ? getCategoryInfo(photo.classification.category)
    : null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="modal-body">
          {/* Image Preview */}
          <div className="modal-image-section">
            <img 
              src={photo.dataUrl} 
              alt={photo.fileName}
              className="modal-image"
            />
          </div>

          {/* Details Section */}
          <div className="modal-details-section">
            <h2 className="modal-title">{photo.fileName}</h2>
            
            <div className="modal-metadata">
              <div className="metadata-item">
                <span className="metadata-label">Size:</span>
                <span className="metadata-value">{formatFileSize(photo.fileSize)}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Dimensions:</span>
                <span className="metadata-value">{photo.imageWidth} × {photo.imageHeight}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Added:</span>
                <span className="metadata-value">{formatDate(photo.dateAdded)}</span>
              </div>
            </div>

            {/* Classification Section */}
            {photo.classification && categoryInfo && (
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">🏷️</span>
                  Classification
                </h3>
                <div 
                  className="category-badge-large"
                  style={{ backgroundColor: categoryInfo.color }}
                >
                  <span className="badge-emoji-large">{categoryInfo.emoji}</span>
                  <span className="badge-label-large">{categoryInfo.label}</span>
                  <span className="confidence-badge">
                    {Math.round(photo.classification.confidence * 100)}% confident
                  </span>
                </div>
              </div>
            )}

            {/* Explainable AI Section */}
            {photo.classification && (
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">💡</span>
                  Why is this photo here?
                </h3>
                <div className="explanation-box">
                  <p>{photo.classification.explanation}</p>
                </div>
              </div>
            )}

            {/* Privacy Risk Section */}
            {photo.privacyRisk && (
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">🔒</span>
                  Privacy Risk Assessment
                </h3>
                <div 
                  className="privacy-box"
                  style={{ 
                    borderColor: PrivacyScanner.getRiskLevelColor(photo.privacyRisk.level),
                  }}
                >
                  <div className="privacy-header">
                    <span 
                      className="privacy-level"
                      style={{ 
                        backgroundColor: PrivacyScanner.getRiskLevelColor(photo.privacyRisk.level),
                      }}
                    >
                      {PrivacyScanner.getRiskLevelIcon(photo.privacyRisk.level)}
                      {photo.privacyRisk.level.toUpperCase()} RISK
                    </span>
                  </div>

                  {photo.privacyRisk.detectedElements.length > 0 && (
                    <div className="detected-elements">
                      <strong>Detected Elements:</strong>
                      <ul>
                        {photo.privacyRisk.detectedElements.map((elem, idx) => (
                          <li key={idx}>{elem}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="privacy-reasons">
                    {photo.privacyRisk.reasons.map((reason, idx) => (
                      <p key={idx}>{reason}</p>
                    ))}
                  </div>

                  {photo.privacyRisk.level !== 'low' && (
                    <div className="privacy-warning">
                      ⚠️ Be careful when sharing this image publicly. It contains personal information.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Digital Memory Lock Section - NEW FEATURE */}
            {MemoryLockGenerator.isEligibleForMemoryLock(photo) && (
              <div className="detail-section">
                <h3 className="section-title">
                  <span className="section-icon">🧠</span>
                  Digital Memory Lock
                </h3>
                <div className="memory-lock-section">
                  {!photo.memoryLock?.enabled ? (
                    <div className="memory-lock-disabled">
                      <p className="memory-lock-description">
                        This photo contains sensitive information. Protect it with memory-based authentication.
                      </p>
                      <div className="memory-lock-features">
                        <div className="feature-item">
                          <span>✓</span> No passwords to remember
                        </div>
                        <div className="feature-item">
                          <span>✓</span> Works completely offline
                        </div>
                        <div className="feature-item">
                          <span>✓</span> Based on your human memory
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        onClick={() => setShowMemoryLockModal(true)}
                      >
                        🧠 Enable Memory Lock
                      </button>
                    </div>
                  ) : (
                    <div className="memory-lock-enabled">
                      <div className="lock-status-badge">
                        <span className="lock-icon">🔐</span>
                        <div>
                          <strong>Memory Lock Active</strong>
                          <p className="lock-status-date">
                            Enabled on {new Date(photo.memoryLock.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      {photo.memoryLock.failedAttempts > 0 && (
                        <div className="failed-attempts-notice">
                          ⚠️ {photo.memoryLock.failedAttempts} failed unlock {photo.memoryLock.failedAttempts === 1 ? 'attempt' : 'attempts'}
                        </div>
                      )}

                      <p className="memory-lock-info">
                        This photo is protected by {photo.memoryLock.questions.length} memory questions. 
                        You must answer correctly to view the full image.
                      </p>

                      <button
                        className="btn-danger btn-small"
                        onClick={() => {
                          if (confirm('Remove memory lock? This photo will no longer be protected.')) {
                            onMemoryLockDisabled?.(photo.id);
                          }
                        }}
                      >
                        Remove Lock
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Memory Lock Setup Modal */}
      {showMemoryLockModal && (
        <MemoryLockModal
          photo={photo}
          onLockEnabled={(questions) => {
            onMemoryLockEnabled?.(photo.id, questions);
            setShowMemoryLockModal(false);
          }}
          onClose={() => setShowMemoryLockModal(false)}
        />
      )}
    </div>
  );
}
