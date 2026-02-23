/**
 * PhotoClassifier - On-device image classification using VLM
 * 
 * Uses RunAnywhere VLM to classify images into categories:
 * - Documents / Receipts
 * - Screenshots
 * - Notes / Text images
 * - Personal photos
 */

import { VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { PhotoCategory, PhotoClassification } from '../types/photo';

export class PhotoClassifier {
  private static CLASSIFICATION_PROMPT = `Analyze this image and classify it into ONE of these categories:
1. DOCUMENT - Official documents, forms, certificates, contracts, legal papers
2. RECEIPT - Store receipts, bills, invoices, payment confirmations
3. SCREENSHOT - Screenshots from phones, computers, or apps
4. NOTE - Handwritten or typed notes, text-heavy images, study materials
5. PERSONAL_PHOTO - Personal photographs, selfies, nature, events, people

Respond with ONLY the category name (DOCUMENT, RECEIPT, SCREENSHOT, NOTE, or PERSONAL_PHOTO) and a brief 1-2 sentence explanation.
Format: CATEGORY: explanation`;

  /**
   * Classify a single image using on-device VLM
   */
  static async classifyImage(
    imageData: Uint8Array,
    width: number,
    height: number
  ): Promise<PhotoClassification> {
    try {
      if (!VLMWorkerBridge.shared.isModelLoaded) {
        throw new Error('VLM model not loaded. Please load a VLM model first.');
      }

      // Process image with VLM
      const result = await VLMWorkerBridge.shared.process(
        imageData,
        width,
        height,
        this.CLASSIFICATION_PROMPT,
        {
          maxTokens: 100,
          temperature: 0.3, // Lower temperature for more consistent classification
        }
      );

      // Parse the response
      return this.parseClassificationResponse(result.text);
    } catch (error) {
      console.error('Classification error:', error);
      // Return unknown category on error
      return {
        category: PhotoCategory.Unknown,
        confidence: 0,
        explanation: 'Failed to classify image: ' + (error as Error).message,
      };
    }
  }

  /**
   * Parse VLM response into structured classification
   */
  private static parseClassificationResponse(response: string): PhotoClassification {
    const text = response.trim().toUpperCase();
    
    // Map of keywords to categories
    const categoryMap: Record<string, PhotoCategory> = {
      'DOCUMENT': PhotoCategory.Document,
      'RECEIPT': PhotoCategory.Receipt,
      'SCREENSHOT': PhotoCategory.Screenshot,
      'NOTE': PhotoCategory.Note,
      'PERSONAL_PHOTO': PhotoCategory.PersonalPhoto,
    };

    // Find which category appears first in the response
    let detectedCategory = PhotoCategory.Unknown;
    let explanation = response;
    
    for (const [keyword, category] of Object.entries(categoryMap)) {
      if (text.includes(keyword)) {
        detectedCategory = category;
        // Extract explanation after the category
        const parts = response.split(':');
        if (parts.length > 1) {
          explanation = parts.slice(1).join(':').trim();
        }
        break;
      }
    }

    // Calculate confidence based on response clarity
    const confidence = detectedCategory !== PhotoCategory.Unknown ? 0.85 : 0.3;

    return {
      category: detectedCategory,
      confidence,
      explanation,
    };
  }

  /**
   * Convert image file to RGB pixel array for VLM processing
   */
  static async imageToRGB(file: File): Promise<{
    rgbPixels: Uint8Array;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        // Scale down large images for faster processing
        const maxDimension = 512;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }

        // Draw to canvas and extract RGB data
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const rgbPixels = new Uint8Array(width * height * 3);

        // Convert RGBA to RGB
        for (let i = 0; i < imageData.data.length / 4; i++) {
          rgbPixels[i * 3] = imageData.data[i * 4];
          rgbPixels[i * 3 + 1] = imageData.data[i * 4 + 1];
          rgbPixels[i * 3 + 2] = imageData.data[i * 4 + 2];
        }

        URL.revokeObjectURL(url);
        resolve({ rgbPixels, width, height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }
}
