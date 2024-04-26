import { ILookupProperty, ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";

export interface ILookup extends IComponent<ILookupParameters, ILookupOutputs, ILookupTranslations> {
    /**
     * If provided, the Lookup will use the returned values of this function to display search results.
     * @param {any} entityNames An array of entity names that he Lookup is currently targeting.
     * @param {any} query: User text input
     * @returns {any}
     */
    onSearch?: (entityNames: string[], query: string) => Promise<ComponentFramework.LookupValue[]>
}

export interface ILookupParameters extends IBaseParameters {
    IsInlineNewEnabled?: ITwoOptionsProperty;
    MultipleEnabled?: ITwoOptionsProperty;
    EnableNavigation?: ITwoOptionsProperty;
    value: ILookupProperty;
}

export interface ILookupOutputs extends IOutputs {
    value?: ComponentFramework.LookupValue[]
}

export interface ILookupTranslations extends ITranslations {
    search: {[LCID: number]: string};
    newRecord: {[LCID: number]: string};
    searching: {[LCID: number]: string};
    noRecordsFound: {[LCID: number]: string};
    resultsFrom: {[LCID: number]: string};
    noName: {[LCID: number]: string};
}

export interface IMetadata extends ComponentFramework.PropertyHelper.EntityMetadata {
    DisplayName: string;
    PrimaryNameAttribute: string;
    PrimaryIdAttribute: string;
}

export interface IEntity {
    entityName: string;
    selected: boolean;
    metadata: Promise<IMetadata>
}