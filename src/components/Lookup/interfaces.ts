import { ILookupProperty } from "../../interfaces";
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
    IsInlineNewEnabled: ComponentFramework.PropertyTypes.StringProperty;
    MultipleEnabled: ComponentFramework.PropertyTypes.StringProperty;
    EnableNavigation: ComponentFramework.PropertyTypes.StringProperty;
    value: ILookupProperty;
}

export interface ILookupOutputs extends IOutputs {
    value?: ComponentFramework.LookupValue[]
}

export interface ILookupTranslations extends ITranslations {

}

export interface IEntity {
    entityName: string;
    selected: boolean;
    metadata: ComponentFramework.PropertyHelper.EntityMetadata & {
        DisplayName: string;
    }
}