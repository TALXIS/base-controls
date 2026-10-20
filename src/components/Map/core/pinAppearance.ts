import { IRecord } from '@talxis/client-libraries';
import { findMatchingMapRule, IMapRuleCondition, parseMapRules } from './rules';

/** How one pin is drawn, once the control has worked out which rule applies to its record. */
export interface IMapPinAppearance {
    /** Fill colour of the shipped pin shape. Ignored once an image or markup is given. */
    color?: string;
    /** Image drawn instead of the shipped shape. */
    url?: string;
    /** Web resource holding that image, resolved to a url by the host. Ignored when `url` is set. */
    webResourceName?: string;
    /** Markup drawn instead of the shipped shape. Inserted as-is, so it is code only, never configuration. */
    svg?: string;
    /** Size of the image or markup, in pixels. Defaults to the shipped pin size. */
    width?: number;
    height?: number;
    /**
     * Where the pin sits on its coordinate: `center` for a badge, `tip` for a marker shape whose
     * bottom point is the position. An image or markup defaults to `center`.
     */
    anchor?: 'center' | 'tip';
    /** Tooltip. Defaults to the record's primary name. */
    title?: string;
}

/**
 * One entry of the `PinRules` parameter: an appearance, and the condition a record has to meet for it.
 * No `svg`: markup is inserted as-is, so it never comes from configuration.
 *
 * Otherwise the shape the legacy MapPicker's `pinIcons` used, so an existing configuration carries over.
 */
export interface IMapPinRule extends Omit<IMapPinAppearance, 'svg'>, IMapRuleCondition { }

/** Works out how one record's pin should look. Returning nothing leaves the pin to the rules below it. */
export type IMapPinResolver = (record: IRecord) => IMapPinAppearance | undefined;

/** Resolves a web resource name to a url the browser can load. */
export type IMapWebResourceResolver = (webResourceName: string) => string | undefined;

/**
 * Reads the pin rules out of the JSON a maker typed into the manifest. A malformed value is reported and
 * ignored rather than allowed to break the map, since it is configuration a person edits by hand.
 */
export const parseMapPinRules = (json?: string | null): IMapPinRule[] => {
    const rules = parseMapRules<IMapPinRule & { svg?: unknown }>(json, 'PinRules');
    if (rules.some((rule) => rule.svg !== undefined)) {
        console.warn('Map: PinRules cannot carry svg, which is drawn as markup. Use the onResolvePin prop for it.');
    }
    return rules.map(({ svg, ...rule }) => rule);
};

/** Works out how a record's pin should look, or `undefined` when no rule applies and the shipped pin should be used. */
export const getMapPinAppearance = (
    record: IRecord,
    rules: IMapPinRule[],
    resolveWebResourceUrl?: IMapWebResourceResolver
): IMapPinAppearance | undefined => {
    const rule = findMatchingMapRule(record, rules);
    if (!rule) {
        return undefined;
    }
    const { attributeName, value, webResourceName, ...appearance } = rule;
    if (!appearance.url && webResourceName) {
        const resolved = resolveWebResourceUrl?.(webResourceName);
        if (resolved) {
            return { ...appearance, url: resolved };
        }
        return appearance;
    }
    return appearance;
};

/**
 * Whether an appearance actually changes anything about how a pin is drawn - `false` for an empty one, so
 * it can be dropped rather than carried on every location.
 */
export const isEmptyPinAppearance = (appearance?: IMapPinAppearance): boolean =>
    !appearance || (!appearance.color && !appearance.url && !appearance.svg && !appearance.title);
