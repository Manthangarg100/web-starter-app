/**
 * PrivacyScanner - Detect sensitive information in images
 * 
 * Uses on-device VLM to scan images for:
 * - ID cards, passports, driver's licenses
 * - Credit cards, bank information
 * - Personal documents with sensitive data
 * - Medical records
 */

import { VLMWorkerBridge } from '@runanywhere/web-llamacpp';
import { PrivacyRisk, PrivacyRiskLevel, PhotoCategory } from '../types/photo';

export class PrivacyScanner {
  private static PRIVACY_SCAN_PROMPT = `Analyze this image CAREFULLY for sensitive personal information that could pose SERIOUS privacy risks if shared publicly.

IMPORTANT: Only flag as HIGH RISK if you clearly see:
1. ID DOCUMENTS: Passports, driver's licenses, national ID cards with visible personal details
2. FINANCIAL: Credit/debit cards with visible numbers, bank statements with account numbers
3. MEDICAL: Prescriptions with patient names, medical records with diagnoses
4. PERSONAL DATA: Social security numbers, full addresses with names, signatures on legal documents

Flag as MEDIUM RISK if:
- Documents without clear personal identifiers
- Screenshots with partial account information
- Business documents with company names only

Flag as LOW RISK if:
- Regular photos, landscapes, objects
- Screenshots without sensitive data
- Generic receipts without personal information
- Notes without identifying details

BE CONSERVATIVE. When in doubt, default to LOW RISK.

Respond in this format:
DETECTED: [specific sensitive items found, or "None"]
RISK: [HIGH/MEDIUM/LOW]
REASON: [brief explanation of why this risk level]`;

  /**
   * Scan an image for privacy risks using on-device VLM
   */
  static async scanImage(
    imageData: Uint8Array,
    width: number,
    height: number,
    category: PhotoCategory
  ): Promise<PrivacyRisk> {
    try {
      if (!VLMWorkerBridge.shared.isModelLoaded) {
        return this.getFallbackRisk(category);
      }

      const result = await VLMWorkerBridge.shared.process(
        imageData,
        width,
        height,
        this.PRIVACY_SCAN_PROMPT,
        {
          maxTokens: 150,
          temperature: 0.2, // Very low temperature for consistent privacy detection
        }
      );

      return this.parsePrivacyResponse(result.text, category);
    } catch (error) {
      console.error('Privacy scan error:', error);
      return this.getFallbackRisk(category);
    }
  }

  /**
   * Parse VLM privacy scan response with stricter validation
   */
  private static parsePrivacyResponse(response: string, category: PhotoCategory): PrivacyRisk {
    const text = response.toUpperCase();
    
    // Start with LOW risk by default (conservative approach)
    let level = PrivacyRiskLevel.Low;
    
    // Only flag HIGH if explicitly stated AND has evidence
    const hasHighRiskStatement = text.includes('RISK: HIGH') || text.includes('HIGH RISK');
    const hasDetectedNone = text.includes('DETECTED: NONE') || text.includes('DETECTED:NONE');
    
    if (hasHighRiskStatement && !hasDetectedNone) {
      level = PrivacyRiskLevel.High;
    } else if (text.includes('RISK: MEDIUM') || text.includes('MEDIUM RISK')) {
      level = PrivacyRiskLevel.Medium;
    }

    // Extract detected elements with stricter matching
    const detectedElements: string[] = [];
    const highRiskKeywords = [
      'PASSPORT',
      'DRIVER LICENSE',
      'DRIVERS LICENSE', 
      'NATIONAL ID',
      'CREDIT CARD NUMBER',
      'DEBIT CARD NUMBER',
      'SOCIAL SECURITY',
      'SSN',
      'MEDICAL RECORD',
      'PRESCRIPTION',
      'BANK ACCOUNT',
    ];

    for (const keyword of highRiskKeywords) {
      if (text.includes(keyword)) {
        detectedElements.push(keyword.toLowerCase().replace(/_/g, ' '));
      }
    }

    // Extract reasons
    const reasons: string[] = [];
    const lines = response.split('\n');
    for (const line of lines) {
      if (line.toUpperCase().startsWith('REASON:') || line.toUpperCase().includes('DETECTED:')) {
        const reason = line.split(':').slice(1).join(':').trim();
        if (reason && reason.toLowerCase() !== 'none' && reason.length > 0) {
          reasons.push(reason);
        }
      }
    }

    // Default reason if none found
    if (reasons.length === 0) {
      if (detectedElements.length > 0) {
        reasons.push(`Detected ${detectedElements.length} potentially sensitive element(s)`);
      } else {
        reasons.push('No significant privacy risks detected');
      }
    }

    // CRITICAL: Only mark as HIGH if we have actual evidence
    // Override VLM if it says HIGH but we found no sensitive elements
    if (level === PrivacyRiskLevel.High && detectedElements.length === 0) {
      level = PrivacyRiskLevel.Low;
      reasons.push('Re-evaluated: No concrete sensitive elements found');
    }

    // Downgrade to MEDIUM if only generic terms detected
    const genericTerms = ['signature', 'address', 'phone', 'certificate'];
    const onlyGenericTerms = detectedElements.every(elem =>
      genericTerms.some(term => elem.includes(term))
    );
    
    if (level === PrivacyRiskLevel.High && onlyGenericTerms && detectedElements.length < 2) {
      level = PrivacyRiskLevel.Medium;
      reasons.push('Adjusted: Only generic identifying information detected');
    }

    return {
      level,
      reasons,
      detectedElements: Array.from(new Set(detectedElements)), // Remove duplicates
    };
  }

  /**
   * Provide fallback privacy risk assessment based on category
   * Conservative approach - default to LOW unless strong evidence
   */
  private static getFallbackRisk(category: PhotoCategory): PrivacyRisk {
    switch (category) {
      case PhotoCategory.Document:
        return {
          level: PrivacyRiskLevel.Low,
          reasons: ['Document type detected - manual review recommended for sensitive content'],
          detectedElements: [],
        };
      
      case PhotoCategory.Receipt:
        return {
          level: PrivacyRiskLevel.Low,
          reasons: ['Receipt detected - typically contains limited personal information'],
          detectedElements: [],
        };
      
      case PhotoCategory.Screenshot:
        return {
          level: PrivacyRiskLevel.Low,
          reasons: ['Screenshot detected - review if it contains account or personal information'],
          detectedElements: [],
        };
      
      case PhotoCategory.Note:
        return {
          level: PrivacyRiskLevel.Low,
          reasons: ['Note or text content detected - generally safe unless containing sensitive info'],
          detectedElements: [],
        };
      
      case PhotoCategory.PersonalPhoto:
        return {
          level: PrivacyRiskLevel.Low,
          reasons: ['Personal photo - no obvious sensitive content detected'],
          detectedElements: [],
        };
      
      default:
        return {
          level: PrivacyRiskLevel.Low,
          reasons: ['No specific privacy risks identified'],
          detectedElements: [],
        };
    }
  }

  /**
   * Get privacy level color for UI display
   */
  static getRiskLevelColor(level: PrivacyRiskLevel): string {
    switch (level) {
      case PrivacyRiskLevel.High:
        return '#ef4444'; // Red
      case PrivacyRiskLevel.Medium:
        return '#f59e0b'; // Amber
      case PrivacyRiskLevel.Low:
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
    }
  }

  /**
   * Get privacy level icon
   */
  static getRiskLevelIcon(level: PrivacyRiskLevel): string {
    switch (level) {
      case PrivacyRiskLevel.High:
        return '🔴';
      case PrivacyRiskLevel.Medium:
        return '🟡';
      case PrivacyRiskLevel.Low:
        return '🟢';
      default:
        return '⚪';
    }
  }
}
