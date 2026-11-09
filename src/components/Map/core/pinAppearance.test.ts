import { describe, expect, it, vi } from 'vitest';
import { getMapPinAppearance, isEmptyPinAppearance, IMapPinRule, parseMapPinRules } from './pinAppearance';
import { createFakeRecord } from '../testing/records';

const record = (category: string) => createFakeRecord({ id: category, rawData: { category } });

const RULES: IMapPinRule[] = [
    { attributeName: 'category', value: 'depot', color: '#c50f1f' },
    { attributeName: 'category', value: 'store', color: '#0f6cbd' },
    { color: '#8a8886' }
];

describe('parseMapPinRules', () => {
    it('reads an array of rules', () => {
        expect(parseMapPinRules('[{"color":"#fff"},{"color":"#000"}]')).toHaveLength(2);
    });

    it('reads a single rule that was not wrapped in an array', () => {
        expect(parseMapPinRules('{"color":"#fff"}')).toEqual([{ color: '#fff' }]);
    });

    it('reads nothing from an empty value', () => {
        expect(parseMapPinRules(undefined)).toEqual([]);
        expect(parseMapPinRules('')).toEqual([]);
        expect(parseMapPinRules('   ')).toEqual([]);
        expect(parseMapPinRules(null)).toEqual([]);
    });

    it('warns and reads nothing from something that is not JSON', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        expect(parseMapPinRules('{not json')).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('PinRules'), expect.anything());
    });

    it('drops entries that are not objects', () => {
        expect(parseMapPinRules('[{"color":"#fff"}, 3, null, "x"]')).toEqual([{ color: '#fff' }]);
    });

    it('drops svg, which is drawn as markup and never comes from configuration', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const rules = parseMapPinRules('[{"color":"#fff","svg":"<svg onload=\\"alert(1)\\"/>"}]');

        expect(rules).toEqual([{ color: '#fff' }]);
        expect(rules[0]).not.toHaveProperty('svg');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('svg'));
    });
});

describe('getMapPinAppearance', () => {
    it('takes the first rule whose attribute matches', () => {
        expect(getMapPinAppearance(record('depot'), RULES)).toEqual({ color: '#c50f1f' });
        expect(getMapPinAppearance(record('store'), RULES)).toEqual({ color: '#0f6cbd' });
    });

    it('falls through to a rule with no attribute', () => {
        expect(getMapPinAppearance(record('service'), RULES)).toEqual({ color: '#8a8886' });
    });

    it('uses the shipped pin when no rule applies', () => {
        expect(getMapPinAppearance(record('service'), RULES.slice(0, 2))).toBeUndefined();
        expect(getMapPinAppearance(record('depot'), [])).toBeUndefined();
    });

    it('matches any record that has a value when the rule names none', () => {
        const rules = [{ attributeName: 'category', color: '#fff' }];
        expect(getMapPinAppearance(record('anything'), rules)).toEqual({ color: '#fff' });
        expect(getMapPinAppearance(createFakeRecord({ rawData: { category: '' } }), rules)).toBeUndefined();
    });

    it('compares as text, so a number in the data matches a string in the rule', () => {
        const numeric = createFakeRecord({ rawData: { level: 3 } });
        expect(getMapPinAppearance(numeric, [{ attributeName: 'level', value: '3', color: '#fff' }]))
            .toEqual({ color: '#fff' });
    });

    it('reads the attribute through a dot notation path', () => {
        const linked = createFakeRecord({ rawData: { 'cds_addressid.cds_kind': 'depot' }, columns: [] });
        expect(getMapPinAppearance(linked, [{ attributeName: 'cds_addressid.cds_kind', value: 'depot', color: '#fff' }]))
            .toEqual({ color: '#fff' });
    });

    it('resolves a web resource to a url', () => {
        const resolve = vi.fn(() => '/WebResources/depot.svg');
        const appearance = getMapPinAppearance(record('depot'), [
            { attributeName: 'category', value: 'depot', webResourceName: 'ntg_depot.svg', width: 40 }
        ], resolve);

        expect(resolve).toHaveBeenCalledWith('ntg_depot.svg');
        expect(appearance).toEqual({ url: '/WebResources/depot.svg', width: 40 });
    });

    it('keeps an explicit url over a web resource', () => {
        const resolve = vi.fn(() => '/WebResources/depot.svg');
        const appearance = getMapPinAppearance(record('depot'), [
            { attributeName: 'category', value: 'depot', url: '/direct.png', webResourceName: 'ntg_depot.svg' }
        ], resolve);

        expect(appearance).toEqual({ url: '/direct.png' });
        expect(resolve).not.toHaveBeenCalled();
    });

    it('drops a web resource the host cannot resolve rather than drawing a broken image', () => {
        const appearance = getMapPinAppearance(record('depot'), [
            { attributeName: 'category', value: 'depot', webResourceName: 'ntg_depot.svg', color: '#fff' }
        ], () => undefined);

        expect(appearance).toEqual({ color: '#fff' });
    });

    it('never leaks the matching fields into the appearance', () => {
        const appearance = getMapPinAppearance(record('depot'), RULES);
        expect(appearance).not.toHaveProperty('attributeName');
        expect(appearance).not.toHaveProperty('value');
    });
});

describe('isEmptyPinAppearance', () => {
    it('is empty when nothing about the pin changes', () => {
        expect(isEmptyPinAppearance(undefined)).toBe(true);
        expect(isEmptyPinAppearance({})).toBe(true);
        expect(isEmptyPinAppearance({ width: 40 })).toBe(true);
    });

    it('is not empty once it says how the pin looks', () => {
        expect(isEmptyPinAppearance({ color: '#fff' })).toBe(false);
        expect(isEmptyPinAppearance({ url: '/a.png' })).toBe(false);
        expect(isEmptyPinAppearance({ svg: '<svg/>' })).toBe(false);
        expect(isEmptyPinAppearance({ title: 'Depot' })).toBe(false);
    });
});
