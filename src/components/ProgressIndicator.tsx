/**
 * ProgressIndicator - Shows classification progress
 */

import { ClassificationProgress } from '../types/photo';

interface ProgressIndicatorProps {
  progress: ClassificationProgress;
}

export function ProgressIndicator({ progress }: ProgressIndicatorProps) {
  const percentage = Math.round((progress.current / progress.total) * 100);

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <h3>Classifying Images...</h3>
        <span className="progress-count">
          {progress.current} / {progress.total}
        </span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="progress-file">
        Processing: {progress.currentFile}
      </p>

      <p className="progress-note">
        All processing happens on your device. This may take a few moments...
      </p>
    </div>
  );
}
