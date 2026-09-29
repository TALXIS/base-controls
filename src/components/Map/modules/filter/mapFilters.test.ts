import { describe, expect, it } from 'vitest';
import { IColumn, Operators, Type } from '@talxis/client-libraries';
import {
    filterRecordsBySelection,
    getMapFilterExpression,
    getMapFilterFacets,
    isMapFilterSelectionEmpty,
    toggleMapFilterValue
} from './mapFilters';
import { createFakeRecord } from '../../testing/records';

const site = (id: string, category: string, city: string) =>
    createFakeRecord({ id, rawData: { category, city } });

const RECORDS = [
    site('a', 'depot', 'Praha'),
    site('b', 'store', 'Praha'),
    site('c', 'store', 'Brno'),
    site('d', 'store', 'Brno'),
    site('e', 'service', 'Ostrava')
];

const COLUMNS = [
    { name: 'category', displayName: 'Category', dataType: 'SingleLine.Text' },
    { name: 'city', displayName: 'City', dataType: 'SingleLine.Text' }
] as unknown as IColumn[];

describe('getMapFilterFacets', () => {
    it('offers the values the records actually hold, most common first', () => {
        const [category] = getMapFilterFacets(RECORDS, ['category'], COLUMNS);

        expect(category.label).toBe('Category');
        expect(category.options).toEqual([
            { value: 'store', label: 'store', count: 3 },
            { value: 'depot', label: 'depot', count: 1 },
            { value: 'service', label: 'service', count: 1 }
        ]);
    });

    it('builds one facet per attribute, in the order they were named', () => {
        const facets = getMapFilterFacets(RECORDS, ['city', 'category'], COLUMNS);
        expect(facets.map((facet) => facet.attribute)).toEqual(['city', 'category']);
    });

    it('falls back to the attribute path when the column has no display name', () => {
        const [facet] = getMapFilterFacets(RECORDS, ['category'], []);
        expect(facet.label).toBe('category');
    });

    it('drops an attribute no record holds a value for', () => {
        expect(getMapFilterFacets(RECORDS, ['nowhere'], COLUMNS)).toEqual([]);
    });

    it('ignores empty and missing values rather than offering them', () => {
        const records = [...RECORDS, createFakeRecord({ id: 'f', rawData: { category: '', city: null } })];
        const [category] = getMapFilterFacets(records, ['category'], COLUMNS);
        expect(category.options.map((option) => option.value)).not.toContain('');
    });

    it('stops offering values once a facet gets unwieldy', () => {
        const many = Array.from({ length: 80 }, (_, index) => site(`r${index}`, `category-${index}`, 'Praha'));
        const [category] = getMapFilterFacets(many, ['category'], COLUMNS, 10);
        expect(category.options).toHaveLength(10);
    });

    it('shows the formatted value while filtering on the raw one', () => {
        const records = [createFakeRecord({
            id: 'a',
            rawData: { statecode: 0, 'statecode@OData.Community.Display.V1.FormattedValue': 'Active' }
        })];
        const [facet] = getMapFilterFacets(records, ['statecode'], []);
        expect(facet.options).toEqual([{ value: '0', label: 'Active', count: 1 }]);
    });
});

describe('filterRecordsBySelection', () => {
    it('keeps everything when nothing is picked', () => {
        expect(filterRecordsBySelection(RECORDS, {})).toHaveLength(5);
        expect(filterRecordsBySelection(RECORDS, { category: [] })).toHaveLength(5);
    });

    it('widens within one attribute', () => {
        const kept = filterRecordsBySelection(RECORDS, { category: ['depot', 'service'] });
        expect(kept.map((record) => record.getRecordId())).toEqual(['a', 'e']);
    });

    it('narrows across attributes', () => {
        const kept = filterRecordsBySelection(RECORDS, { category: ['store'], city: ['Brno'] });
        expect(kept.map((record) => record.getRecordId())).toEqual(['c', 'd']);
    });

    it('keeps the order the records came in', () => {
        const kept = filterRecordsBySelection(RECORDS, { city: ['Praha', 'Ostrava'] });
        expect(kept.map((record) => record.getRecordId())).toEqual(['a', 'b', 'e']);
    });

    it('keeps nothing when a picked value matches no record', () => {
        expect(filterRecordsBySelection(RECORDS, { city: ['Vienna'] })).toEqual([]);
    });
});

describe('getMapFilterExpression', () => {
    it('builds nothing when nothing is picked', () => {
        expect(getMapFilterExpression({})).toBeNull();
        expect(getMapFilterExpression({ category: [] })).toBeNull();
    });

    it('uses an equality for a single value', () => {
        expect(getMapFilterExpression({ category: ['depot'] })).toEqual({
            filterOperator: Type.And.Value,
            conditions: [{ attributeName: 'category', conditionOperator: Operators.Equal.Value, value: 'depot' }]
        });
    });

    it('uses an in for several values, and ands the attributes together', () => {
        expect(getMapFilterExpression({ category: ['depot', 'store'], city: ['Brno'] })).toEqual({
            filterOperator: Type.And.Value,
            conditions: [
                { attributeName: 'category', conditionOperator: Operators.In.Value, value: ['depot', 'store'] },
                { attributeName: 'city', conditionOperator: Operators.Equal.Value, value: 'Brno' }
            ]
        });
    });
});

describe('toggleMapFilterValue', () => {
    it('adds a value that was not picked', () => {
        expect(toggleMapFilterValue({}, 'category', 'depot')).toEqual({ category: ['depot'] });
    });

    it('removes a value that was', () => {
        expect(toggleMapFilterValue({ category: ['depot', 'store'] }, 'category', 'depot'))
            .toEqual({ category: ['store'] });
    });

    it('leaves the other attributes alone', () => {
        expect(toggleMapFilterValue({ city: ['Brno'] }, 'category', 'depot'))
            .toEqual({ city: ['Brno'], category: ['depot'] });
    });
});

describe('isMapFilterSelectionEmpty', () => {
    it('is empty when nothing is picked anywhere', () => {
        expect(isMapFilterSelectionEmpty({})).toBe(true);
        expect(isMapFilterSelectionEmpty({ a: [], b: [] })).toBe(true);
        expect(isMapFilterSelectionEmpty({ a: [], b: ['x'] })).toBe(false);
    });
});
