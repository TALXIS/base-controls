import { ReactNode } from 'react';
import { IRecord } from '@talxis/client-libraries';
import { IContext } from '@interfaces';
import { ITheme } from '@legacy';
import { IMapLocation } from '../../providers/provider';
import { findMatchingMapRule, IMapRuleCondition, parseMapRules } from '../../core/rules';
import { IMapCardsLabels } from './labels';

/**
 * What activating a pin does.
 *
 * `fields` shows the record's columns, `adaptiveCard` renders an Adaptive Card template, `form` renders the
 * record through the Form base control, `function` runs a web resource instead of showing anything, and
 * `none` leaves the pin inert beyond selecting its record.
 */
export type IMapCardType = 'fields' | 'adaptiveCard' | 'form' | 'function' | 'none';

/** A button on a card, which runs a function in a web resource. */
export interface IMapCardAction {
    label: string;
    webResourceName: string;
    functionName: string;
}

export interface IMapCardDefinition {
    type: IMapCardType;
    /** Attributes the `fields` card shows, in order. Empty shows the dataset's visible columns. */
    columns?: string[];
    /** Adaptive Card template as JSON, for the `adaptiveCard` type. */
    template?: string;
    /** FormXml the `form` type lays the record out with. Takes precedence over `formId`. */
    formXml?: string;
    /** Id of a Dataverse `systemform` whose FormXml the `form` type reads through `Xrm.WebApi`. */
    formId?: string;
    /**
     * Web resource and function the `function` type runs, and the fallback for a card's actions. On a `form`
     * card they are the form's load handler, called with the record and its `formContext`.
     */
    webResourceName?: string;
    functionName?: string;
    /** Buttons the card shows, each running a function in a web resource. */
    actions?: IMapCardAction[];
    /** Heading. Defaults to the record's primary name. */
    title?: string;
}

/** One card rule: a card, and the condition a record has to meet for it. */
export interface IMapCardRule extends IMapCardDefinition, IMapRuleCondition { }

export interface IMapCardProps {
    /** Record the card is about. */
    record: IRecord;
    /** Pin the card was opened from. */
    location: IMapLocation;
    definition: IMapCardDefinition;
    context: IContext;
    theme: ITheme;
    labels: IMapCardsLabels;
    /** Runs one of the card's buttons. */
    onExecuteAction: (action: IMapCardAction) => void;
    /** Deletes the record. Present only for one the map itself created. */
    onDelete?: () => void;
    onClose: () => void;
}

/**
 * Renders the card for one record.
 *
 * A renderer that returns nothing opens no card, which is how the `function` type runs a web resource
 * instead of showing something.
 */
export type IMapCardRenderer = (props: IMapCardProps) => ReactNode;

/** One record behind a grouped pin, as the group's card lists it. */
export interface IMapClusterMemberProps {
    record: IRecord;
    /** The record's own pin, so a row can show it the way the map does. Absent for a record the map could not place. */
    location?: IMapLocation;
    theme: ITheme;
    labels: IMapCardsLabels;
}

/**
 * Renders one row of a grouped pin's list. The default shows the record's pin and primary name; a host
 * replaces it through the module's `components.onRenderClusterMember` to show what tells its records apart.
 */
export type IMapClusterMemberRenderer = (props: IMapClusterMemberProps) => ReactNode;

/** Renderers by card type. A host adds to these through the module's `renderers` option. */
export interface IMapCardRenderers {
    [type: string]: IMapCardRenderer;
}

/** The card a pin opens when nothing says otherwise. */
export const DEFAULT_MAP_CARD: IMapCardDefinition = { type: 'fields' };

/** Reads card rules out of JSON a maker typed into a manifest property, for a wrapper that exposes one. */
export const parseMapCardRules = (json?: string | null, parameterName = 'CardRules'): IMapCardRule[] =>
    parseMapRules<IMapCardRule>(json, parameterName);

/**
 * Works out what activating a record's pin should do. The same matching as the pin rules, so "depots open
 * an Adaptive Card, everything else runs a function" is expressed the same way as "depots are red".
 */
export const getMapCardDefinition = (
    record: IRecord,
    rules: IMapCardRule[],
    fallback: IMapCardDefinition = DEFAULT_MAP_CARD
): IMapCardDefinition => {
    const rule = findMatchingMapRule(record, rules);
    if (!rule) {
        return fallback;
    }
    const { attributeName, value, ...definition } = rule;
    return { ...fallback, ...definition };
};

/**
 * Suffix Dataverse appends to an attribute key to carry its display ready value.
 * Adaptive Cards templating cannot bind a key holding `@` and `.`, which is why it gets renamed.
 */
const FORMATTED_VALUE_SUFFIX = '@OData.Community.Display.V1.FormattedValue';

/** What a renamed formatted value is bound as: `${$root.statecode_label}`. */
const FORMATTED_VALUE_ALIAS = '_label';

/**
 * Copies record data with its formatted value annotations renamed to something a template can bind:
 * `statecode@OData.Community.Display.V1.FormattedValue` becomes `statecode_label`, since Adaptive Cards
 * binding cannot address a key containing `@` or `.`. Returns a copy rather than mutating in place.
 */
export const renameFormattedValueKeys = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map(renameFormattedValueKeys);
    }
    if (!data || typeof data !== 'object') {
        return data;
    }
    const renamed: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(data)) {
        const name = key.includes(FORMATTED_VALUE_SUFFIX)
            ? key.replace(FORMATTED_VALUE_SUFFIX, FORMATTED_VALUE_ALIAS)
            : key;
        renamed[name] = renameFormattedValueKeys(value);
    }
    return renamed;
};
