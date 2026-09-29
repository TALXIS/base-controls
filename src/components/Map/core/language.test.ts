import { afterEach, describe, expect, it, vi } from 'vitest';
import { getMapLanguageTag } from './language';

afterEach(() => vi.unstubAllGlobals());

describe('getMapLanguageTag', () => {
    it('maps the LCIDs the control ships translations for', () => {
        expect(getMapLanguageTag(1029)).toBe('cs');
        expect(getMapLanguageTag(1033)).toBe('en');
    });

    it('maps a region specific LCID to its base language', () => {
        expect(getMapLanguageTag(2057)).toBe('en');
        expect(getMapLanguageTag(3082)).toBe('es');
    });

    it('falls back to the browser language for an LCID it does not know', () => {
        vi.stubGlobal('navigator', { language: 'de-AT' });
        expect(getMapLanguageTag(9999)).toBe('de');
        expect(getMapLanguageTag(undefined)).toBe('de');
    });

    it('lets the service pick when nothing says otherwise', () => {
        vi.stubGlobal('navigator', { language: '' });
        expect(getMapLanguageTag(undefined)).toBeUndefined();
    });
});
