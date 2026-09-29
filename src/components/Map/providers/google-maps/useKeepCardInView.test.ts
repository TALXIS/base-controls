import { describe, expect, it } from 'vitest';
import { getCardShift } from './useKeepCardInView';

const container = { top: 100, bottom: 500 };

describe('getCardShift', () => {
    it('leaves a popup that fits alone', () => {
        expect(getCardShift({ top: 150, bottom: 400 }, container)).toBe(0);
    });

    it('moves the centre up for a popup poking out above the map - the list-to-card growth case', () => {
        //40px above the top edge, plus the 8px margin
        expect(getCardShift({ top: 60, bottom: 300 }, container)).toBe(-48);
    });

    it('moves the centre down for a popup poking out below', () => {
        expect(getCardShift({ top: 300, bottom: 540 }, container)).toBe(48);
    });

    it('aligns a popup taller than the map to the top, so its header is what shows', () => {
        //pokes out below by 100 but has only 20 to spare above the margin - moving down by 100 would hide the header
        expect(getCardShift({ top: 128, bottom: 600 }, container)).toBe(20);
    });
});
