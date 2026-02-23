/**
 * MemoryLockGenerator - Generate contextual questions using on-device LLM
 * 
 * Creates human-memory-based questions for photo authentication.
 * Uses metadata like time, category, and visual context to generate
 * questions only the true owner can answer.
 * 
 * This is a PRIVACY-FIRST authentication method:
 * - No passwords to remember
 * - No biometrics to store
 * - No cloud authentication
 * - Questions based on human memory and context
 */

import { TextGeneration } from '@runanywhere/web-llamacpp';
import { PhotoMetadata, PhotoCategory, PrivacyRiskLevel } from '../types/photo';

export interface MemoryQuestion {
  question: string;
  correctAnswer: string;
  options: string[];
}

export interface MemoryLock {
  enabled: boolean;
  questions: MemoryQuestion[];
  createdAt: Date;
  failedAttempts: number;
}

export class MemoryLockGenerator {
  /**
   * Generate contextual memory questions for a photo
   * Uses on-device LLM to create personalized questions
   */
  static async generateQuestions(photo: PhotoMetadata): Promise<MemoryQuestion[]> {
    const questions: MemoryQuestion[] = [];

    try {
      // Generate 2 contextual questions using metadata
      questions.push(await this.generateTimeBasedQuestion(photo));
      questions.push(await this.generateCategoryBasedQuestion(photo));

      return questions;
    } catch (error) {
      console.error('Failed to generate memory questions:', error);
      // Fallback to metadata-based questions if LLM fails
      return this.generateFallbackQuestions(photo);
    }
  }

  /**
   * Generate a time-based question using LLM
   */
  private static async generateTimeBasedQuestion(photo: PhotoMetadata): Promise<MemoryQuestion> {
    const dateAdded = new Date(photo.dateAdded);
    const hour = dateAdded.getHours();
    
    // Determine time period
    let timePeriod: string;
    let correctAnswer: string;
    
    if (hour >= 5 && hour < 12) {
      timePeriod = 'morning';
      correctAnswer = 'Morning (5 AM - 12 PM)';
    } else if (hour >= 12 && hour < 17) {
      timePeriod = 'afternoon';
      correctAnswer = 'Afternoon (12 PM - 5 PM)';
    } else if (hour >= 17 && hour < 21) {
      timePeriod = 'evening';
      correctAnswer = 'Evening (5 PM - 9 PM)';
    } else {
      timePeriod = 'night';
      correctAnswer = 'Night (9 PM - 5 AM)';
    }

    const prompt = `Generate a natural, conversational question asking when a photo was added to the system. The correct time period is "${timePeriod}". Make it sound like a memory recall question, not a technical question. Keep it under 15 words.

Example: "When did you add this photo to your organizer?"

Generate one question:`;

    try {
      const response = await TextGeneration.generate(prompt, {
        maxTokens: 30,
        temperature: 0.7,
      });

      const question = response.text.trim().replace(/["']/g, '');
      
      return {
        question: question || 'When did you add this photo to your collection?',
        correctAnswer,
        options: [
          'Morning (5 AM - 12 PM)',
          'Afternoon (12 PM - 5 PM)',
          'Evening (5 PM - 9 PM)',
          'Night (9 PM - 5 AM)',
        ],
      };
    } catch (error) {
      // Fallback question
      return {
        question: 'When did you add this photo to your collection?',
        correctAnswer,
        options: [
          'Morning (5 AM - 12 PM)',
          'Afternoon (12 PM - 5 PM)',
          'Evening (5 PM - 9 PM)',
          'Night (9 PM - 5 AM)',
        ],
      };
    }
  }

  /**
   * Generate a category-based question using LLM and classification context
   */
  private static async generateCategoryBasedQuestion(photo: PhotoMetadata): Promise<MemoryQuestion> {
    if (!photo.classification) {
      return this.getGenericCategoryQuestion();
    }

    const category = photo.classification.category;
    let correctAnswer: string;
    let options: string[];

    // Determine correct answer based on category
    switch (category) {
      case PhotoCategory.Document:
        correctAnswer = 'Official documents or certificates';
        options = [
          'Official documents or certificates',
          'Personal photos or memories',
          'Shopping receipts or bills',
          'App screenshots',
        ];
        break;
      
      case PhotoCategory.Receipt:
        correctAnswer = 'Shopping receipts or bills';
        options = [
          'Shopping receipts or bills',
          'Official documents or certificates',
          'Personal photos or memories',
          'App screenshots',
        ];
        break;
      
      case PhotoCategory.Screenshot:
        correctAnswer = 'App screenshots';
        options = [
          'App screenshots',
          'Personal photos or memories',
          'Official documents or certificates',
          'Shopping receipts or bills',
        ];
        break;
      
      case PhotoCategory.Note:
        correctAnswer = 'Handwritten or typed notes';
        options = [
          'Handwritten or typed notes',
          'Personal photos or memories',
          'Official documents or certificates',
          'Shopping receipts or bills',
        ];
        break;
      
      case PhotoCategory.PersonalPhoto:
        correctAnswer = 'Personal photos or memories';
        options = [
          'Personal photos or memories',
          'Official documents or certificates',
          'Shopping receipts or bills',
          'App screenshots',
        ];
        break;
      
      default:
        return this.getGenericCategoryQuestion();
    }

    const prompt = `Generate a natural question asking what type of image this is. The correct type is "${correctAnswer}". Make it sound like a memory recall question. Keep it under 15 words.

Example: "What kind of image is this?"

Generate one question:`;

    try {
      const response = await TextGeneration.generate(prompt, {
        maxTokens: 30,
        temperature: 0.7,
      });

      const question = response.text.trim().replace(/["']/g, '');
      
      return {
        question: question || 'What type of content does this image contain?',
        correctAnswer,
        options,
      };
    } catch (error) {
      return {
        question: 'What type of content does this image contain?',
        correctAnswer,
        options,
      };
    }
  }

  /**
   * Generate context-based question using classification explanation
   */
  static async generateContextQuestion(photo: PhotoMetadata): Promise<MemoryQuestion> {
    if (!photo.classification?.explanation) {
      return this.getGenericCategoryQuestion();
    }

    const explanation = photo.classification.explanation;
    
    // Extract key context from explanation
    const hasText = explanation.toLowerCase().includes('text');
    const hasNumbers = explanation.toLowerCase().includes('number');
    const hasPeople = explanation.toLowerCase().includes('people') || explanation.toLowerCase().includes('person');
    
    let correctAnswer: string;
    let options: string[];

    if (hasText && hasNumbers) {
      correctAnswer = 'Contains text and numbers';
      options = [
        'Contains text and numbers',
        'Shows people or faces',
        'Is a photograph',
        'Contains only images',
      ];
    } else if (hasPeople) {
      correctAnswer = 'Shows people or faces';
      options = [
        'Shows people or faces',
        'Contains text and numbers',
        'Is a document or form',
        'Contains only images',
      ];
    } else if (hasText) {
      correctAnswer = 'Contains readable text';
      options = [
        'Contains readable text',
        'Is a photograph',
        'Shows people or faces',
        'Contains only images',
      ];
    } else {
      correctAnswer = 'Is a photograph or image';
      options = [
        'Is a photograph or image',
        'Contains text and numbers',
        'Shows people or faces',
        'Is a document or form',
      ];
    }

    return {
      question: 'What does this image mainly contain?',
      correctAnswer,
      options,
    };
  }

  /**
   * Generate fallback questions when LLM is unavailable
   */
  private static generateFallbackQuestions(photo: PhotoMetadata): MemoryQuestion[] {
    const questions: MemoryQuestion[] = [];

    // Time-based question
    const dateAdded = new Date(photo.dateAdded);
    const hour = dateAdded.getHours();
    let timeAnswer: string;
    
    if (hour >= 5 && hour < 12) timeAnswer = 'Morning (5 AM - 12 PM)';
    else if (hour >= 12 && hour < 17) timeAnswer = 'Afternoon (12 PM - 5 PM)';
    else if (hour >= 17 && hour < 21) timeAnswer = 'Evening (5 PM - 9 PM)';
    else timeAnswer = 'Night (9 PM - 5 AM)';

    questions.push({
      question: 'When did you add this photo to your collection?',
      correctAnswer: timeAnswer,
      options: [
        'Morning (5 AM - 12 PM)',
        'Afternoon (12 PM - 5 PM)',
        'Evening (5 PM - 9 PM)',
        'Night (9 PM - 5 AM)',
      ],
    });

    // Category-based question
    const category = photo.classification?.category || PhotoCategory.Unknown;
    let categoryAnswer: string;
    
    switch (category) {
      case PhotoCategory.Document:
        categoryAnswer = 'Official documents or certificates';
        break;
      case PhotoCategory.Receipt:
        categoryAnswer = 'Shopping receipts or bills';
        break;
      case PhotoCategory.Screenshot:
        categoryAnswer = 'App screenshots';
        break;
      case PhotoCategory.Note:
        categoryAnswer = 'Handwritten or typed notes';
        break;
      default:
        categoryAnswer = 'Personal photos or memories';
    }

    questions.push({
      question: 'What type of content does this image contain?',
      correctAnswer: categoryAnswer,
      options: [
        'Official documents or certificates',
        'Shopping receipts or bills',
        'App screenshots',
        'Personal photos or memories',
      ],
    });

    return questions;
  }

  /**
   * Generic category question fallback
   */
  private static getGenericCategoryQuestion(): MemoryQuestion {
    return {
      question: 'What type of image is this?',
      correctAnswer: 'Personal photos or memories',
      options: [
        'Personal photos or memories',
        'Official documents or certificates',
        'Shopping receipts or bills',
        'App screenshots',
      ],
    };
  }

  /**
   * Validate answers to memory questions
   */
  static validateAnswers(
    questions: MemoryQuestion[],
    answers: string[]
  ): boolean {
    if (questions.length !== answers.length) return false;

    for (let i = 0; i < questions.length; i++) {
      if (questions[i].correctAnswer !== answers[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if a photo is eligible for memory lock
   */
  static isEligibleForMemoryLock(photo: PhotoMetadata): boolean {
    // Only high-risk photos can be locked
    return photo.privacyRisk?.level === PrivacyRiskLevel.High;
  }
}
