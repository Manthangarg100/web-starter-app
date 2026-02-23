/**
 * UnlockPromptModal - Answer memory questions to unlock a photo
 * 
 * Presents the contextual questions to the user and validates answers.
 * If correct, the photo is unlocked. If incorrect, access is denied.
 * 
 * This is the core of the Digital Memory Lock authentication.
 */

import { useState } from 'react';
import { MemoryQuestion } from '../types/photo';
import { MemoryLockGenerator } from '../utils/MemoryLockGenerator';

interface UnlockPromptModalProps {
  questions: MemoryQuestion[];
  fileName: string;
  onUnlock: () => void;
  onFailed: () => void;
  onClose: () => void;
  failedAttempts: number;
}

export function UnlockPromptModal({ 
  questions, 
  fileName,
  onUnlock, 
  onFailed,
  onClose,
  failedAttempts,
}: UnlockPromptModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>(
    new Array(questions.length).fill('')
  );
  const [isValidating, setIsValidating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  /**
   * Handle answer selection
   */
  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  /**
   * Move to next question
   */
  const handleNext = () => {
    if (!selectedAnswers[currentQuestionIndex]) return;
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  /**
   * Submit answers and validate
   */
  const handleSubmit = async () => {
    if (selectedAnswers.some(a => !a)) return;

    setIsValidating(true);

    // Simulate a brief validation delay for UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const isValid = MemoryLockGenerator.validateAnswers(questions, selectedAnswers);
    
    setIsSuccess(isValid);
    setShowResult(true);
    setIsValidating(false);

    // Wait for result animation
    setTimeout(() => {
      if (isValid) {
        onUnlock();
      } else {
        onFailed();
      }
    }, 2000);
  };

  /**
   * Go back to previous question
   */
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content unlock-prompt-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        {!showResult && (
          <>
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>

            <div className="unlock-header">
              <div className="unlock-icon">🔐</div>
              <h2>Unlock Photo</h2>
              <p className="unlock-filename">{fileName}</p>
              {failedAttempts > 0 && (
                <div className="failed-attempts-warning">
                  ⚠️ {failedAttempts} failed {failedAttempts === 1 ? 'attempt' : 'attempts'}
                </div>
              )}
            </div>

            {!isValidating ? (
              <>
                <div className="question-progress">
                  <div className="progress-dots">
                    {questions.map((_, idx) => (
                      <div 
                        key={idx}
                        className={`progress-dot ${
                          idx === currentQuestionIndex ? 'active' : 
                          idx < currentQuestionIndex ? 'completed' : ''
                        }`}
                      />
                    ))}
                  </div>
                  <p className="progress-text">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>

                <div className="unlock-question">
                  <h3>{currentQuestion.question}</h3>
                  
                  <div className="unlock-options">
                    {currentQuestion.options.map((option, idx) => (
                      <button
                        key={idx}
                        className={`unlock-option ${
                          selectedAnswers[currentQuestionIndex] === option ? 'selected' : ''
                        }`}
                        onClick={() => handleSelectAnswer(option)}
                      >
                        <span className="option-radio">
                          {selectedAnswers[currentQuestionIndex] === option && '●'}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="unlock-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleBack}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Back
                  </button>
                  
                  {!isLastQuestion ? (
                    <button
                      className="btn-primary"
                      onClick={handleNext}
                      disabled={!selectedAnswers[currentQuestionIndex]}
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      onClick={handleSubmit}
                      disabled={selectedAnswers.some(a => !a)}
                    >
                      Unlock Photo
                    </button>
                  )}
                </div>

                <div className="unlock-hint">
                  <span className="hint-icon">💡</span>
                  <p>Answer based on your memory of adding this photo</p>
                </div>
              </>
            ) : (
              <div className="unlock-validating">
                <div className="spinner" />
                <h3>Validating Answers...</h3>
                <p>Checking your responses</p>
              </div>
            )}
          </>
        )}

        {showResult && (
          <div className="unlock-result">
            {isSuccess ? (
              <>
                <div className="result-icon success-icon">✅</div>
                <h2>Access Granted!</h2>
                <p>Your memory served you well. Unlocking photo...</p>
              </>
            ) : (
              <>
                <div className="result-icon failure-icon">❌</div>
                <h2>Access Denied</h2>
                <p>Incorrect answers. The photo remains locked.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
