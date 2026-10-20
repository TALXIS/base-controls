import { Template } from 'adaptivecards-templating';

/** Matches one binding in a template string: `${$root.name}`, `${name}`, `${$data.city}`. */
const BINDING = /\$\{([^{}]+)\}/g;

/** Prefixes a binding may start with, all of which address the data the card was given. */
const DATA_PREFIXES = ['$root.', '$data.'];

let hasWarnedAboutEngine = false;

/** Reads a value out of the card data by a dotted path. */
const getBoundValue = (data: any, path: string): any => {
    const prefix = DATA_PREFIXES.find((candidate) => path.startsWith(candidate));
    const segments = (prefix ? path.slice(prefix.length) : path).split('.');
    return segments.reduce((current, segment) => (
        current === null || current === undefined ? undefined : current[segment.trim()]
    ), data);
};

/**
 * Substitutes the simple bindings of a template, without an expression engine.
 *
 * This covers `${$root.attribute}` and the dotted paths under it, which is what a card bound to a record
 * needs. Anything it cannot resolve is left as written, exactly as the templating engine's own default for
 * an undefined field does, so a missing value is visible rather than silently blank.
 */
export const expandSimpleBindings = (node: any, data: any): any => {
    if (typeof node === 'string') {
        return node.replace(BINDING, (whole, path) => {
            const value = getBoundValue(data, `${path}`.trim());
            return value === undefined || value === null ? whole : `${value}`;
        });
    }
    if (Array.isArray(node)) {
        return node.map((child) => expandSimpleBindings(child, data));
    }
    if (node && typeof node === 'object') {
        return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, expandSimpleBindings(value, data)]));
    }
    return node;
};

/**
 * Expands an Adaptive Card template against a record's data.
 *
 * The full templating engine is used wherever it runs, which gives the whole language - `$data` repetition,
 * `$when` conditions, functions. It parses expressions with `adaptive-expressions`, which in turn uses
 * `antlr4ts`, and that combination does not survive every bundler: under Vite's dependency optimizer it
 * throws because a Node `assert` shim is left undefined. Rather than let a card fail to render because of
 * where it was bundled, the simple bindings are substituted instead and the loss of the rest is reported.
 */
export const expandAdaptiveCardTemplate = (payload: object, data: any): object => {
    try {
        return new Template(payload).expand({ $root: data }) as object;
    } catch (error) {
        if (!hasWarnedAboutEngine) {
            hasWarnedAboutEngine = true;
            console.warn(
                'Map: the Adaptive Cards templating engine could not run in this bundle, so only simple '
                + '${...} bindings are substituted. Repetition and conditions in the template are left as written.',
                error
            );
        }
        return expandSimpleBindings(payload, data);
    }
};
