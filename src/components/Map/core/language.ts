/**
 * BCP 47 tags for the LCIDs a Power Platform host reports.
 *
 * Only the primary language matters to a geo service, so a region specific LCID maps to its base language.
 * Anything not listed falls through to the browser's own language rather than being guessed at.
 */
const LANGUAGE_TAGS: { [lcid: number]: string } = {
    1025: 'ar', 1026: 'bg', 1027: 'ca', 1028: 'zh', 1029: 'cs', 1030: 'da', 1031: 'de', 1032: 'el',
    1033: 'en', 1035: 'fi', 1036: 'fr', 1037: 'he', 1038: 'hu', 1039: 'is', 1040: 'it', 1041: 'ja',
    1042: 'ko', 1043: 'nl', 1044: 'no', 1045: 'pl', 1046: 'pt', 1048: 'ro', 1049: 'ru', 1050: 'hr',
    1051: 'sk', 1053: 'sv', 1054: 'th', 1055: 'tr', 1057: 'id', 1058: 'uk', 1060: 'sl', 1061: 'et',
    1062: 'lv', 1063: 'lt', 1066: 'vi', 2052: 'zh', 2057: 'en', 2070: 'pt', 3082: 'es', 1034: 'es',
    3084: 'fr', 2058: 'es', 1110: 'gl', 1069: 'eu'
};

/**
 * The language a geo-coding or routing service should answer in - `undefined` lets the service pick,
 * which is better than sending a wrong one.
 */
export const getMapLanguageTag = (languageId?: number): string | undefined => {
    if (languageId && LANGUAGE_TAGS[languageId]) {
        return LANGUAGE_TAGS[languageId];
    }
    return typeof navigator === 'undefined' ? undefined : navigator.language?.split('-')[0] || undefined;
};
