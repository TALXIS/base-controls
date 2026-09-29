import { IMapCardDefinition } from '../../cards';

/**
 * Reads the FormXml a `form` card lays its record out with.
 *
 * FormXml written into the definition wins. Otherwise `formId` names a Dataverse `systemform`, read through
 * `Xrm.WebApi` - so a maker points a card at a form they already designed rather than copying its XML. Outside
 * a host that provides `Xrm` a form id cannot be read, and nothing is returned.
 */
export const loadMapCardFormXml = async (definition: IMapCardDefinition): Promise<string | undefined> => {
    if (definition.formXml) {
        return definition.formXml;
    }
    if (!definition.formId) {
        return undefined;
    }
    const webApi = window.Xrm?.WebApi;
    if (typeof webApi?.retrieveRecord !== 'function') {
        console.warn(`Map: the card form "${definition.formId}" needs a host that provides Xrm.WebApi, so it was not read.`);
        return undefined;
    }
    try {
        const form = await webApi.retrieveRecord('systemform', definition.formId, '?$select=formxml');
        return typeof form?.formxml === 'string' && form.formxml ? form.formxml : undefined;
    } catch (error) {
        console.error(`Map: the card form "${definition.formId}" could not be read:`, error);
        return undefined;
    }
};
