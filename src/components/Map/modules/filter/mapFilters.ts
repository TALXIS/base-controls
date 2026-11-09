import { IColumn, IRecord, Operators, Type } from '@talxis/client-libraries';
import { getRecordFormattedValue, getRecordValue } from '../../core/attributes';

/** Distinct values one facet offers before it stops being a useful thing to click through. */
export const DEFAULT_MAX_FILTER_OPTIONS = 50;

/** Where a filter is applied: to the pins the map draws, or to the dataset every bound control shares. */
export type IMapFilterMode = 'pins' | 'dataset';

export interface IMapFilterOption {
    /** The value as the record holds it, which is what a filter expression carries. */
    value: string;
    /** The value as the record displays it. */
    label: string;
    /** Records carrying it, out of the ones loaded. */
    count: number;
}

export interface IMapFilterFacet {
    /** Attribute path the facet filters on. */
    attribute: string;
    /** Column display name, falling back to the attribute path. */
    label: string;
    options: IMapFilterOption[];
}

/** Values the user has picked, per attribute. An attribute with none picked is not filtered. */
export interface IMapFilterSelection {
    [attribute: string]: string[];
}

/**
 * Reads the values each filter attribute actually holds, so the panel offers what is there rather than what
 * the schema allows.
 */
export const getMapFilterFacets = (
    records: IRecord[],
    attributes: string[],
    columns: IColumn[] = [],
    maxOptions = DEFAULT_MAX_FILTER_OPTIONS
): IMapFilterFacet[] => {
    const columnsByName = new Map(columns.map((column) => [column.name, column]));

    return attributes.map((attribute) => {
        const tally = new Map<string, IMapFilterOption>();
        records.forEach((record) => {
            const value = getRecordValue(record, attribute);
            if (value === undefined || value === null || value === '') {
                return;
            }
            const key = `${value}`;
            const existing = tally.get(key);
            if (existing) {
                existing.count += 1;
                return;
            }
            tally.set(key, {
                value: key,
                label: getRecordFormattedValue(record, attribute) ?? key,
                count: 1
            });
        });

        return {
            attribute,
            label: columnsByName.get(attribute)?.displayName ?? attribute,
            options: [...tally.values()]
                .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
                .slice(0, maxOptions)
        };
    }).filter((facet) => facet.options.length > 0);
};

/** Whether anything is actually filtered. */
export const isMapFilterSelectionEmpty = (selection: IMapFilterSelection): boolean =>
    Object.values(selection).every((values) => !values.length);

/**
 * Keeps the records matching the picked values. Values picked within one attribute widen the result,
 * attributes narrow it - which is what a person clicking through facets expects: "depots or stores, in
 * Brno".
 */
export const filterRecordsBySelection = (records: IRecord[], selection: IMapFilterSelection): IRecord[] => {
    if (isMapFilterSelectionEmpty(selection)) {
        return records;
    }
    const picked = Object.entries(selection)
        .filter(([, values]) => values.length)
        .map(([attribute, values]) => ({ attribute, values: new Set(values) }));

    return records.filter((record) => picked.every(({ attribute, values }) => {
        const value = getRecordValue(record, attribute);
        return value !== undefined && value !== null && values.has(`${value}`);
    }));
};

/**
 * Turns the picked values into a filter for the bound dataset, so every control sharing it follows. Values
 * within an attribute become an `In`, and the attributes are combined with `And`. A provider that does not
 * implement `In` for a given data type - the in-memory one used by demos, for instance - is why the pin
 * mode above exists.
 */
export const getMapFilterExpression = (
    selection: IMapFilterSelection
): ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null => {
    const conditions = Object.entries(selection)
        .filter(([, values]) => values.length)
        .map(([attributeName, values]) => ({
            attributeName,
            conditionOperator: values.length === 1 ? Operators.Equal.Value : Operators.In.Value,
            value: values.length === 1 ? values[0] : values
        }));

    return conditions.length ? { conditions, filterOperator: Type.And.Value } : null;
};

/** Adds or removes one value from a selection. */
export const toggleMapFilterValue = (
    selection: IMapFilterSelection,
    attribute: string,
    value: string
): IMapFilterSelection => {
    const current = selection[attribute] ?? [];
    const next = current.includes(value)
        ? current.filter((picked) => picked !== value)
        : [...current, value];
    return { ...selection, [attribute]: next };
};
