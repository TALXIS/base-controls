import { describe, expect, it, vi } from 'vitest';
import {
    DEFAULT_MAP_CARD,
    getMapCardDefinition,
    IMapCardRule,
    parseMapCardRules,
    renameFormattedValueKeys
} from './cards';
import { createFakeRecord } from '../../testing/records';

const record = (category: string) => createFakeRecord({ id: category, rawData: { category } });

const RULES: IMapCardRule[] = [
    { attributeName: 'category', value: 'depot', type: 'adaptiveCard', template: '{"type":"AdaptiveCard"}' },
    { attributeName: 'category', value: 'service', type: 'function', webResourceName: 'ntg_map.js', functionName: 'openService' },
    { type: 'fields', columns: ['name', 'city'] }
];

describe('parseMapCardRules', () => {
    it('reads the rules, and nothing from an empty value', () => {
        expect(parseMapCardRules('[{"type":"fields"}]')).toEqual([{ type: 'fields' }]);
        expect(parseMapCardRules(undefined)).toEqual([]);
    });

    it('warns about invalid JSON naming the property to fix', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => { });
        expect(parseMapCardRules('{oops')).toEqual([]);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('CardRules'), expect.anything());
    });
});

describe('getMapCardDefinition', () => {
    it('takes the first rule whose attribute matches', () => {
        expect(getMapCardDefinition(record('depot'), RULES)).toMatchObject({ type: 'adaptiveCard' });
        expect(getMapCardDefinition(record('service'), RULES)).toMatchObject({
            type: 'function',
            functionName: 'openService'
        });
    });

    it('falls through to a rule with no attribute', () => {
        expect(getMapCardDefinition(record('store'), RULES)).toMatchObject({
            type: 'fields',
            columns: ['name', 'city']
        });
    });

    it('uses the fallback when no rule applies', () => {
        expect(getMapCardDefinition(record('store'), RULES.slice(0, 2))).toEqual(DEFAULT_MAP_CARD);
        expect(getMapCardDefinition(record('store'), [], { type: 'none' })).toEqual({ type: 'none' });
    });

    it('layers a rule over the fallback rather than replacing it wholesale', () => {
        const definition = getMapCardDefinition(record('store'), [{ type: 'fields' }], {
            type: 'fields',
            columns: ['name'],
            actions: [{ label: 'Open', webResourceName: 'w', functionName: 'f' }]
        });
        expect(definition.columns).toEqual(['name']);
        expect(definition.actions).toHaveLength(1);
    });

    it('never leaks the matching fields into the definition', () => {
        const definition = getMapCardDefinition(record('depot'), RULES);
        expect(definition).not.toHaveProperty('attributeName');
        expect(definition).not.toHaveProperty('value');
    });
});

describe('renameFormattedValueKeys', () => {
    const SUFFIX = '@OData.Community.Display.V1.FormattedValue';

    it('renames an annotation to something a template can bind', () => {
        expect(renameFormattedValueKeys({ statecode: 0, [`statecode${SUFFIX}`]: 'Active' }))
            .toEqual({ statecode: 0, statecode_label: 'Active' });
    });

    it('renames at every depth', () => {
        const renamed = renameFormattedValueKeys({
            address: { city: 1, [`city${SUFFIX}`]: 'Praha' }
        });
        expect(renamed.address.city_label).toBe('Praha');
    });

    it('renames inside arrays', () => {
        const renamed = renameFormattedValueKeys({
            lines: [{ qty: 2, [`qty${SUFFIX}`]: 'Two' }]
        });
        expect(renamed.lines[0].qty_label).toBe('Two');
    });

    it('leaves everything else alone', () => {
        expect(renameFormattedValueKeys({ name: 'Praha', count: 3, active: true, missing: null }))
            .toEqual({ name: 'Praha', count: 3, active: true, missing: null });
    });

    it('does not mutate what it was given', () => {
        const original = { statecode: 0, [`statecode${SUFFIX}`]: 'Active' };
        renameFormattedValueKeys(original);
        expect(original).toEqual({ statecode: 0, [`statecode${SUFFIX}`]: 'Active' });
    });

    it('passes primitives straight through', () => {
        expect(renameFormattedValueKeys('text')).toBe('text');
        expect(renameFormattedValueKeys(null)).toBeNull();
        expect(renameFormattedValueKeys(undefined)).toBeUndefined();
    });
});
