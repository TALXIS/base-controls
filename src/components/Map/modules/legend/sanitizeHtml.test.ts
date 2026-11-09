import { describe, expect, it } from 'vitest';
import { sanitizeMapHtml } from './sanitizeHtml';

describe('sanitizeMapHtml', () => {
    it('keeps the formatting a legend is made of', () => {
        const html = '<div><h4>Sites</h4><ul><li><b>Depot</b></li></ul><table><tr><td>1</td></tr></table></div>';
        const clean = sanitizeMapHtml(html);

        expect(clean).toContain('<h4>Sites</h4>');
        expect(clean).toContain('<li><b>Depot</b></li>');
        expect(clean).toContain('<td>1</td>');
    });

    it('keeps the inline styles the colour swatches need', () => {
        const clean = sanitizeMapHtml('<span style="background:#c50f1f;width:12px"></span>');
        expect(clean).toContain('background');
        expect(clean).toContain('#c50f1f');
    });

    it('keeps inline SVG, which is the other way a swatch is drawn', () => {
        const clean = sanitizeMapHtml('<svg width="12" height="12"><circle cx="6" cy="6" r="6" fill="#107c10"/></svg>');
        expect(clean).toContain('<svg');
        expect(clean).toContain('<circle');
        expect(clean).toContain('#107c10');
    });

    it('removes a script', () => {
        const clean = sanitizeMapHtml('<div>Sites<script>alert(1)</script></div>');
        expect(clean).not.toContain('script');
        expect(clean).toContain('Sites');
    });

    it('removes an event handler', () => {
        const clean = sanitizeMapHtml('<div onclick="alert(1)" onmouseover="alert(2)">Sites</div>');
        expect(clean).not.toContain('onclick');
        expect(clean).not.toContain('onmouseover');
        expect(clean).toContain('Sites');
    });

    it('removes a javascript url', () => {
        const clean = sanitizeMapHtml('<a href="javascript:alert(1)">Go</a>');
        expect(clean).not.toContain('javascript:');
    });

    it('removes anything that could submit or embed', () => {
        const clean = sanitizeMapHtml('<form action="/x"><input name="a"></form><iframe src="/y"></iframe>');
        expect(clean).not.toContain('<form');
        expect(clean).not.toContain('<input');
        expect(clean).not.toContain('<iframe');
    });

    it('opens a surviving link detached from the app', () => {
        const clean = sanitizeMapHtml('<a href="https://example.com">Legend key</a>');
        expect(clean).toContain('href="https://example.com"');
        expect(clean).toContain('target="_blank"');
        expect(clean).toContain('rel="noopener noreferrer"');
    });

    it('cleans nothing out of nothing', () => {
        expect(sanitizeMapHtml(undefined)).toBe('');
        expect(sanitizeMapHtml(null)).toBe('');
        expect(sanitizeMapHtml('   ')).toBe('');
    });
});
