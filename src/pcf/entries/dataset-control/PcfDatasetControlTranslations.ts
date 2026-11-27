import { Liquid } from "liquidjs";
import type { IPcfDatasetControlConfig } from "./PcfBindingEntryShared";

/** The `Translations` binding: each key's text by LCID. */
export type PcfDatasetControlTranslationDictionary = { [key: string]: { [languageId: string]: string } };

export interface IPcfDatasetControlTranslationsParameters {
    dictionary: PcfDatasetControlTranslationDictionary;
    languageId: number;
}

const LIQUID = new Liquid();
const FALLBACK_LANGUAGE_ID = '1033';
//{{t 'key'}} or {{t 'key' name: 'value', other: 'value'}}
const TRANSLATION_MARKER = /\{\{\s*t\s+'([^']+)'((?:\s*,?\s*\w+\s*:\s*'[^']*')*)\s*\}\}/g;
const MARKER_VARIABLE = /(\w+)\s*:\s*'([^']*)'/g;
const TEMPLATE_VARIABLE = /\{\{\s*(\w+)\s*\}\}/g;

/** Resolves the `{{t 'key'}}` markers of a binding in the user's language. */
export class PcfDatasetControlTranslations {
    private _dictionary: PcfDatasetControlTranslationDictionary;
    private _languageId: string;
    private _missingKeys = new Set<string>();

    constructor(parameters: IPcfDatasetControlTranslationsParameters) {
        this._dictionary = parameters.dictionary;
        this._languageId = String(parameters.languageId);
    }

    /** A copy of the config with the strings the dataset control reads translated. */
    public translateConfig<TData>(config: IPcfDatasetControlConfig<TData>): IPcfDatasetControlConfig<TData> {
        return {
            ...config,
            views: config.views?.map(view => ({
                ...view,
                name: this._translate(view.name),
                group: view.group && { ...view.group, name: this._translate(view.group.name) },
                columns: view.columns && this._translateDeep(view.columns),
            })),
            metadata: config.metadata && this._translateDeep(config.metadata),
        };
    }

    private _translate(text: string): string {
        return text.replace(TRANSLATION_MARKER, (_marker, key: string, variables: string) => this._getText(key, this._parseVariables(variables)));
    }

    private _translateDeep<T>(value: T): T {
        if (typeof value === 'string') {
            return this._translate(value) as T;
        }
        if (Array.isArray(value)) {
            return value.map(item => this._translateDeep(item)) as T;
        }
        if (value && typeof value === 'object') {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this._translateDeep(item)])) as T;
        }
        return value;
    }

    private _getText(key: string, variables: Record<string, string>): string {
        const texts = this._dictionary[key];
        if (!texts) {
            if (!this._missingKeys.has(key)) {
                this._missingKeys.add(key);
                console.warn(`The Translations binding has no key '${key}'.`);
            }
            return key;
        }
        const text = texts[this._languageId] ?? texts[FALLBACK_LANGUAGE_ID] ?? Object.values(texts)[0] ?? key;
        //a variable the marker does not set stays, so the provider's values can fill it later
        return text.replace(TEMPLATE_VARIABLE, (template, name: string) => name in variables ? variables[name] : template);
    }

    private _parseVariables(text: string): Record<string, string> {
        return Object.fromEntries([...text.matchAll(MARKER_VARIABLE)].map(([, name, value]) => [name, value]));
    }
}

/** A copy of a binding's override whose `{{ field }}` templates read the provider's value at the same place. */
export const renderOverride = <T>(override: T, original: unknown): T => renderValue(override, original, original) as T;

const renderValue = (value: unknown, scope: unknown, original: unknown): unknown => {
    if (typeof value === 'string') {
        return value.includes('{{') ? renderTemplate(value, scope) : value;
    }
    if (Array.isArray(value)) {
        const originals = Array.isArray(original) ? original : [];
        return value.map((item, index) => {
            //an option is matched by its value, not by where it sits
            const match = isOption(item) ? originals.find(option => isOption(option) && option.Value === item.Value) : originals[index];
            return renderValue(item, match, match);
        });
    }
    if (value && typeof value === 'object') {
        const originalObject = original && typeof original === 'object' ? original as Record<string, unknown> : {};
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, renderValue(item, originalObject, originalObject[key])]));
    }
    return value;
};

const renderTemplate = (template: string, scope: unknown): string => {
    try {
        return LIQUID.parseAndRenderSync(template, scope && typeof scope === 'object' ? scope as object : {});
    }
    catch {
        return template;
    }
};

const isOption = (value: unknown): value is { Value: unknown } => !!value && typeof value === 'object' && 'Value' in value;
