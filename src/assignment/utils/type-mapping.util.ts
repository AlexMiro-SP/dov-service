/**
 * Utility for mapping snippet types between frontend and Django backend
 *
 * Frontend uses: CTA, FAQ, DESCRIPTION
 * Django backend uses: CTA, FAQ, DEFAULT
 *
 * This mapping ensures compatibility without requiring database migration
 */

export class TypeMappingUtil {
  /**
   * Map frontend type to Django backend type
   * DESCRIPTION (frontend) → DEFAULT (Django)
   */
  static mapTypeToBackend(frontendType: string): string {
    const mapping: Record<string, string> = {
      DESCRIPTION: 'DEFAULT',
      CTA: 'CTA',
      FAQ: 'FAQ',
    };

    return mapping[frontendType] || frontendType;
  }

  /**
   * Map Django backend type to frontend type
   * DEFAULT (Django) → DESCRIPTION (frontend)
   */
  static mapTypeToFrontend(backendType: string): string {
    const mapping: Record<string, string> = {
      DEFAULT: 'DESCRIPTION',
      CTA: 'CTA',
      FAQ: 'FAQ',
    };

    return mapping[backendType] || backendType;
  }

  /**
   * Get all valid frontend types
   */
  static getValidFrontendTypes(): string[] {
    return ['CTA', 'FAQ', 'DESCRIPTION'];
  }

  /**
   * Get all valid backend types
   */
  static getValidBackendTypes(): string[] {
    return ['CTA', 'FAQ', 'DEFAULT'];
  }
}
