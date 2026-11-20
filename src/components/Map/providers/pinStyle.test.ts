import { describe, expect, it } from 'vitest';
import { getClusterPinLabel, getClusterPinSize, getClusterPinSvg, getPinOpacity, getPinSvg, isSelectionOfCard } from './pinStyle';

describe('getClusterPinLabel', () => {
    it('shows a small group exactly', () => {
        expect(getClusterPinLabel(2)).toBe('2');
        expect(getClusterPinLabel(999)).toBe('999');
    });

    it('shortens a group of thousands', () => {
        expect(getClusterPinLabel(1000)).toBe('1k');
        expect(getClusterPinLabel(1500)).toBe('1.5k');
        expect(getClusterPinLabel(12400)).toBe('12k');
    });
});

describe('getClusterPinSize', () => {
    it('grows with the group, between a floor and a ceiling', () => {
        const small = getClusterPinSize(2);
        const medium = getClusterPinSize(100);
        const huge = getClusterPinSize(100000);

        expect(small).toBeLessThan(medium);
        expect(medium).toBeLessThan(huge);
        expect(small).toBeGreaterThanOrEqual(32);
        expect(huge).toBeLessThanOrEqual(56);
    });
});

describe('pin markup', () => {
    it('draws a single pin in the colour it was given', () => {
        expect(getPinSvg('#ff0000')).toContain('fill="#ff0000"');
    });

    it('draws a group pin carrying its count', () => {
        const svg = getClusterPinSvg(42, '#0078d4', '#ffffff');
        expect(svg).toContain('>42<');
        expect(svg).toContain('#0078d4');
        expect(svg).toContain(`width="${getClusterPinSize(42)}"`);
    });
});

describe('getPinOpacity', () => {
    const pin = (id: string) => ({ id, latitude: 0, longitude: 0 });

    it('dims nothing when nothing is selected', () => {
        expect(getPinOpacity(pin('a'), new Set())).toBe(1);
    });

    it('dims the pins outside the selection', () => {
        expect(getPinOpacity(pin('a'), new Set(['a']))).toBe(1);
        expect(getPinOpacity(pin('b'), new Set(['a']))).toBeLessThan(1);
    });

    it('never dims a group, which may well contain the selection', () => {
        const cluster = {
            ...pin('cluster-1'),
            cluster: { count: 3, recordIds: ['b', 'c', 'd'], expansionZoom: 12 }
        };
        expect(getPinOpacity(cluster, new Set(['a']))).toBe(1);
    });
});

describe('isSelectionOfCard', () => {
    it('is true for the one record the open card was opened for', () => {
        expect(isSelectionOfCard('r1', ['r1'])).toBe(true);
    });

    it('leaves a selection built with ctrl/cmd+click alone', () => {
        expect(isSelectionOfCard('r1', ['r1', 'r2'])).toBe(false);
        expect(isSelectionOfCard('r1', ['r2'])).toBe(false);
    });

    it('is false with no open card, no selection, or a group card', () => {
        expect(isSelectionOfCard(undefined, ['r1'])).toBe(false);
        expect(isSelectionOfCard('r1', [])).toBe(false);
        expect(isSelectionOfCard('cluster-7', ['r1'])).toBe(false);
    });
});
