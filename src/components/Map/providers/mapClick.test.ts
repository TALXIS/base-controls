import { describe, expect, it } from 'vitest';
import { isMapSurfaceClick } from './mapClick';

describe('isMapSurfaceClick', () => {
    it('accepts a click on an element that is still on the page', () => {
        const element = document.createElement('div');
        document.body.appendChild(element);
        expect(isMapSurfaceClick(element)).toBe(true);
        element.remove();
    });

    it('rejects a click on an element that removed itself as it was pressed', () => {
        const element = document.createElement('button');
        document.body.appendChild(element);
        element.remove();
        expect(isMapSurfaceClick(element)).toBe(false);
    });

    it('rejects a click whose target was never on the page', () => {
        expect(isMapSurfaceClick(document.createElement('div'))).toBe(false);
    });

    it('accepts a click with no target to judge, rather than swallowing it', () => {
        expect(isMapSurfaceClick(null)).toBe(true);
        expect(isMapSurfaceClick(undefined)).toBe(true);
        expect(isMapSurfaceClick({} as EventTarget)).toBe(true);
    });
});
