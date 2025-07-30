export class LocaleUtils {
  static toDjangoFormat(locale: string): string {
    return locale.replace('-', '_');
  }

  static toDovServiceFormat(locale: string): string {
    return locale.replace('_', '-');
  }

  static normalizeToDjango(locale: string): string {
    if (!locale) {
      return 'en_GB';
    }

    return locale.includes('-') ? this.toDjangoFormat(locale) : locale;
  }
}
