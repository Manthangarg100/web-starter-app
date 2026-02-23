/**
 * ExplainableAI - Generate human-readable explanations for classifications
 * 
 * Uses on-device LLM to create detailed explanations for why an image
 * was classified into a specific category
 */

import { VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { PhotoCategory } from '../types/photo';

export class ExplainableAI {
  /**
   * Generate a detailed explanation for why an image was classified
   * into a specific category
   */
  static async explainClassification(
    imageData: Uint8Array,
    width: number,
    height: number,
    category: PhotoCategory
  ): Promise<string> {
    try {
      if (!VLMWorkerBridge.shared.isModelLoaded) {
        return this.getFallbackExplanation(category);
      }

      const prompt = this.buildExplanationPrompt(category);
      
      const result = await VLMWorkerBridge.shared.process(
        imageData,
        width,
        height,
        prompt,
        {
          maxTokens: 120,
          temperature: 0.7,
        }
      );

      return result.text.trim();
    } catch (error) {
      console.error('Explanation generation error:', error);
      return this.getFallbackExplanation(category);
    }
  }

  /**
   * Build a detailed explanation prompt based on category
   */
  private static buildExplanationPrompt(category: PhotoCategory): string {
    const categoryDescriptions = {
      [PhotoCategory.Document]: 'official documents, forms, certificates, or legal papers',
      [PhotoCategory.Receipt]: 'receipts, bills, invoices, or payment confirmations',
      [PhotoCategory.Screenshot]: 'screenshots from devices or applications',
      [PhotoCategory.Note]: 'handwritten or typed notes, or text-heavy content',
      [PhotoCategory.PersonalPhoto]: 'personal photographs, selfies, or event photos',
      [PhotoCategory.Unknown]: 'images that don\'t fit clear categories',
    };

    return `This image was classified as "${category}". Analyze the image and explain in 2-3 sentences WHY it fits the category of ${categoryDescriptions[category]}. Focus on specific visual elements like text layout, structure, colors, objects, or content type that led to this classification.`;
  }

  /**
   * Provide a fallback explanation when VLM is not available
   */
  private static getFallbackExplanation(category: PhotoCategory): string {
    const fallbacks = {
      [PhotoCategory.Document]: 'Classified as Document based on formal layout, structured text content, and document-like formatting typically found in official papers.',
      [PhotoCategory.Receipt]: 'Classified as Receipt due to presence of transaction details, item listings, prices, and typical receipt formatting.',
      [PhotoCategory.Screenshot]: 'Classified as Screenshot because of UI elements, app interfaces, or digital screen capture indicators.',
      [PhotoCategory.Note]: 'Classified as Note due to text-heavy content, handwriting, or note-taking formatting patterns.',
      [PhotoCategory.PersonalPhoto]: 'Classified as Personal Photo based on photographic content showing people, places, or personal moments.',
      [PhotoCategory.Unknown]: 'Unable to confidently classify this image into a specific category.',
    };

    return fallbacks[category];
  }

  /**
   * Generate a privacy risk explanation
   */
  static async explainPrivacyRisk(
    imageData: Uint8Array,
    width: number,
    height: number,
    detectedElements: string[]
  ): Promise<string> {
    try {
      if (!VLMWorkerBridge.shared.isModelLoaded) {
        return this.getFallbackPrivacyExplanation(detectedElements);
      }

      const prompt = `Analyze this image for sensitive personal information. Look for:
- ID cards, passports, driver's licenses
- Credit/debit cards, bank information
- Social security numbers, personal identification numbers
- Addresses, phone numbers
- Medical records, prescriptions
- Signatures

List any sensitive information you detect and explain the privacy risk in 2-3 sentences.`;

      const result = await VLMWorkerBridge.shared.process(
        imageData,
        width,
        height,
        prompt,
        {
          maxTokens: 150,
          temperature: 0.4,
        }
      );

      return result.text.trim();
    } catch (error) {
      console.error('Privacy explanation error:', error);
      return this.getFallbackPrivacyExplanation(detectedElements);
    }
  }

  /**
   * Fallback privacy explanation
   */
  private static getFallbackPrivacyExplanation(detectedElements: string[]): string {
    if (detectedElements.length === 0) {
      return 'No significant privacy risks detected. This image appears safe to share.';
    }

    return `Privacy risk detected: Found ${detectedElements.join(', ')}. These elements contain personal information that should be protected and not shared publicly.`;
  }
}
