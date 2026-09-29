import { describe, expect, it } from 'vitest';
import { CARD_MAX_HEIGHT } from './layout';
import { getCardMaxHeight } from './useCardMaxHeight';

describe('getCardMaxHeight', () => {
    it('keeps the full cap on a map tall enough for it', () => {
        expect(getCardMaxHeight(900)).toBe(CARD_MAX_HEIGHT);
        expect(getCardMaxHeight(560)).toBe(CARD_MAX_HEIGHT);
    });

    it('lowers the cap on a map too short for the full card, leaving room for the popup chrome and the pin', () => {
        //a 400px map panel - the case where a 420px card put its header and close button above the map
        expect(getCardMaxHeight(400)).toBe(260);
        expect(getCardMaxHeight(400)).toBeLessThan(400);
    });

    it('never shrinks the card below a usable slit', () => {
        expect(getCardMaxHeight(200)).toBe(160);
        expect(getCardMaxHeight(50)).toBe(160);
    });

    it('falls back to the full cap until the map has a measured height', () => {
        expect(getCardMaxHeight(undefined)).toBe(CARD_MAX_HEIGHT);
        expect(getCardMaxHeight(0)).toBe(CARD_MAX_HEIGHT);
    });
});
