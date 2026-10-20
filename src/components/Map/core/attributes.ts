import { Attribute, IAvailableRelatedColumn, ILinkEntityExposedExpression, IRawRecord, IRecord } from '@talxis/client-libraries';

/** Suffix Dataverse appends to an attribute key to carry its display ready value. */
const FORMATTED_VALUE_SUFFIX = '@OData.Community.Display.V1.FormattedValue';

/** Link type every attribute path the control registers is joined with, so a missing related row keeps the pin. */
const LINK_TYPE = 'outer';

interface IRawLookup {
    container: IRawRecord;
    key: string;
}

/**
 * Locates the object a dot notation path's last segment lives on. A link entity attribute arrives from
 * Dataverse as one flat key (`cds_addressid.cds_latitude`); an expanded record arrives as a nested object,
 * so the flat key is tried at every level before descending.
 */
const findRawLookup = (source: any, segments: string[]): IRawLookup | undefined => {
    if (source === null || source === undefined || !segments.length) {
        return undefined;
    }
    //an expanded collection resolves through its first row, which is what a 1:N pin binding means
    if (Array.isArray(source)) {
        return source.length ? findRawLookup(source[0], segments) : undefined;
    }
    if (typeof source !== 'object') {
        return undefined;
    }
    const flatKey = segments.join('.');
    if (Object.prototype.hasOwnProperty.call(source, flatKey)) {
        return { container: source, key: flatKey };
    }
    if (segments.length === 1) {
        return undefined;
    }
    const [head, ...rest] = segments;
    return Object.prototype.hasOwnProperty.call(source, head) ? findRawLookup(source[head], rest) : undefined;
};

/** Whether an attribute path crosses a link entity. */
export const isLinkedAttributePath = (path: string): boolean => !!path && Attribute.GetLinkedEntityAlias(path) !== null;

/**
 * Reads a record attribute named by a path. The registered column is preferred, so value expressions and
 * typed conversions still apply; a path the dataset does not carry as a column falls back to walking the
 * raw data.
 */
export const getRecordValue = (record: IRecord, path: string): any => {
    if (!path) {
        return undefined;
    }
    try {
        const value = record.getValue(path);
        if (value !== null && value !== undefined) {
            return value;
        }
    } catch (error) {
        //an unregistered column throws rather than returning nothing, and the raw walk below still may find it
    }
    const lookup = findRawLookup(record.getRawData(), path.split('.'));
    return lookup ? lookup.container[lookup.key] ?? undefined : undefined;
};

/** Reads the display ready value of a record attribute named by a path. */
export const getRecordFormattedValue = (record: IRecord, path: string): string | undefined => {
    if (!path) {
        return undefined;
    }
    try {
        const formatted = record.getFormattedValue(path);
        if (formatted) {
            return formatted;
        }
    } catch (error) {
        //same as getRecordValue - an unregistered column is not an error here, it is a raw data lookup
    }
    const lookup = findRawLookup(record.getRawData(), path.split('.'));
    if (!lookup) {
        return undefined;
    }
    const formatted = lookup.container[`${lookup.key}${FORMATTED_VALUE_SUFFIX}`];
    if (typeof formatted === 'string') {
        return formatted;
    }
    const value = lookup.container[lookup.key];
    return value === null || value === undefined || value === '' ? undefined : `${value}`;
};

/**
 * Reads a record attribute as a coordinate. Coordinates reach the control as numbers or as strings a text
 * attribute holds, and neither is validated by the dataset - so anything unparseable reads as no
 * coordinate at all rather than as `NaN`.
 */
export const getRecordCoordinate = (record: IRecord, path: string): number | undefined => {
    const value = getRecordValue(record, path);
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const coordinate = typeof value === 'number' ? value : parseFloat(`${value}`);
    return Number.isFinite(coordinate) ? coordinate : undefined;
};

/**
 * Builds the link entity expression that makes a dot notation attribute path resolvable. The alias a maker
 * writes in the path is the alias of the link and the lookup attribute it joins on, so
 * `cds_addressid.cds_latitude` links the target of `cds_addressid` under the alias `cds_addressid`.
 */
export const getAttributePathLinking = (
    path: string,
    relatedColumns: IAvailableRelatedColumn[],
    existingLinking: ILinkEntityExposedExpression[]
): ILinkEntityExposedExpression | undefined => {
    const alias = Attribute.GetLinkedEntityAlias(path);
    if (!alias || existingLinking.some((link) => link.alias === alias)) {
        return undefined;
    }
    const relatedColumn = relatedColumns.find((column) => column.name === alias);
    if (!relatedColumn) {
        return undefined;
    }
    return {
        alias: alias,
        name: relatedColumn.relatedEntityName,
        from: relatedColumn.relatedEntityPrimaryIdAttribute,
        to: relatedColumn.name,
        linkType: LINK_TYPE
    };
};

/** Reduces the attribute paths a control was configured with to the distinct, non empty ones. */
export const getDistinctAttributePaths = (paths: (string | undefined | null)[]): string[] =>
    [...new Set(paths.filter((path): path is string => !!path))];
