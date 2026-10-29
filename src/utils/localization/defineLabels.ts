import type { Labels } from "./types";

/** A component's English strings. */
export interface ILabelSet<T extends Labels = Labels> {
    readonly defaults: T;
}

const DEFINED_DEFAULTS = new Map<string, string>();

/** Declares a component's English strings, each under a prefixed key no other set uses. */
export const defineLabels = <const T extends Labels>(defaults: T): ILabelSet<T> => {
    for (const [key, value] of Object.entries(defaults)) {
        //a bundle loaded twice defines the same set again
        if (DEFINED_DEFAULTS.has(key) && DEFINED_DEFAULTS.get(key) !== value) {
            throw new Error(`The label '${key}' is defined twice.`);
        }
        DEFINED_DEFAULTS.set(key, value);
    }
    return { defaults };
};

/** Translations of one set, with their keys checked against it. */
export const translateLabels = <T extends Labels>(_set: ILabelSet<T>, strings: Partial<Record<keyof T & string, string>>): Labels => strings as Labels;
