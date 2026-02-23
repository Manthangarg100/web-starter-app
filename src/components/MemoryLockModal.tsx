/**
 * MemoryLockModal - Set up Digital Memory Lock for high-risk photos
 * 
 * This modal guides the user through setting up memory-based authentication:
 * 1. Explain the feature
 * 2. Generate contextual questions using on-device LLM
 * 3. Show questions and correct answers to the user
 * 4. Enable the lock
 * 
 * NO PASSWORDS • NO BIOMETRICS • NO CLOUD
 */

import { useState } from 'react';
import { PhotoMetadata, MemoryQuestion } from '../types/photo';
import { MemoryLockGenerator } from '../utils/MemoryLockGenerator';

interface MemoryLockModalProps {
  photo: PhotoMetadata;
  onLockEnabled: (questions: MemoryQuestion[]) => void;
  onClose: () => void;
}

type SetupStep = 'intro' | 'generating' | 'review' | 'success';

export function MemoryLockModal({ photo, onLockEnabled, onClose }: MemoryLockModalProps) {
  const [step, setStep] = useState<SetupStep>('intro');
  const [questions, setQuestions] = useState<MemoryQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate memory questions using on-device LLM
   */
  const handleGenerateQuestions = async () => {
    setStep('generating');
    setError(null);

    try {
      const generatedQuestions = await MemoryLockGenerator.generateQuestions(photo);
      setQuestions(generatedQuestions);
      setStep('review');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      setStep('intro');
    }
  };

  /**
   * Enable the memory lock
   */
  const handleEnableLock = () => {
    onLockEnabled(questions);
    setStep('success');
    setTimeout(() => onClose(), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content memory-lock-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>

        {/* Step 1: Introduction */}
        {step === 'intro' && (
          <div className="memory-lock-step">
            <div className="memory-lock-icon">🧠</div>
            <h2>Digital Memory Lock</h2>
            <p className="memory-lock-subtitle">
              Protect this sensitive photo with your human memory
            </p>

            <div className="memory-lock-explainer">
              <h3>How it works:</h3>
              <ul>
                <li>
                  <span className="explainer-icon">🤖</span>
                  <div>
                    <strong>AI generates contextual questions</strong>
                    <p>Questions only you can answer based on when and what the photo is</p>
                  </div>
                </li>
                <li>
                  <span className="explainer-icon">🔒</span>
                  <div>
                    <strong>Photo becomes locked</strong>
                    <p>The image will be blurred until you answer correctly</p>
                  </div>
                </li>
                <li>
                  <span className="explainer-icon">💾</span>
                  <div>
                    <strong>Stored locally on your device</strong>
                    <p>No passwords, no cloud, no biometrics needed</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="memory-lock-benefits">
              <div className="benefit-badge">
                <span>✅</span> No passwords to forget
              </div>
              <div className="benefit-badge">
                <span>✅</span> Works completely offline
              </div>
              <div className="benefit-badge">
                <span>✅</span> Privacy-first design
              </div>
            </div>

            <button 
              className="btn-primary btn-large"
              onClick={handleGenerateQuestions}
            >
              Generate Memory Questions
            </button>

            {error && <p className="error-text">{error}</p>}
          </div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <div className="memory-lock-step">
            <div className="spinner" />
            <h2>Analyzing Photo Context...</h2>
            <p className="memory-lock-subtitle">
              Using on-device AI to create personalized questions
            </p>
          </div>
        )}

        {/* Step 3: Review Questions */}
        {step === 'review' && (
          <div className="memory-lock-step">
            <div className="memory-lock-icon">📝</div>
            <h2>Review Your Memory Questions</h2>
            <p className="memory-lock-subtitle">
              These questions will unlock your photo. Only you know the answers!
            </p>

            <div className="memory-questions-review">
              {questions.map((q, idx) => (
                <div key={idx} className="memory-question-card">
                  <div className="question-number">Question {idx + 1}</div>
                  <h3>{q.question}</h3>
                  
                  <div className="question-options">
                    {q.options.map((option, optIdx) => (
                      <div 
                        key={optIdx}
                        className={`option-item ${option === q.correctAnswer ? 'correct' : ''}`}
                      >
                        {option === q.correctAnswer && <span className="checkmark">✓</span>}
                        {option}
                      </div>
                    ))}
                  </div>
                  
                  <div className="correct-answer-note">
                    <strong>Correct Answer:</strong> {q.correctAnswer}
                  </div>
                </div>
              ))}
            </div>

            <div className="memory-lock-warning">
              <span className="warning-icon">⚠️</span>
              <p>
                <strong>Important:</strong> Remember these answers! 
                You'll need them to view this photo in the future.
              </p>
            </div>

            <div className="memory-lock-actions">
              <button 
                className="btn-secondary"
                onClick={() => setStep('intro')}
              >
                Generate Different Questions
              </button>
              <button 
                className="btn-primary"
                onClick={handleEnableLock}
              >
                Enable Memory Lock
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <div className="memory-lock-step">
            <div className="success-icon">✅</div>
            <h2>Memory Lock Enabled!</h2>
            <p className="memory-lock-subtitle">
              This photo is now protected by your human memory
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
