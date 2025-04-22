import { ITagPickerProps } from "@talxis/react-components";
import { ILookupProperty, ITwoOptionsProperty } from "../../interfaces";
import { IControl, IOutputs, ITranslations } from "../../interfaces/context";
import { IBaseParameters } from "../../interfaces/parameters";
import { lookupTranslations } from "./translations";

export interface ILookup extends IControl<ILookupParameters, ILookupOutputs, Partial<ITranslations<typeof lookupTranslations>>, ILookupComponentProps> {
    /**
     * If provided, the Lookup will use the returned values of this function to display search results.
     * @param {any} entityNames An array of entity names that he Lookup is currently targeting.
     * @param {any} query: User text input
     * @returns {any}
     */
    onSearch?: (entityNames: string[], query: string) => Promise<ComponentFramework.LookupValue[]>
}

export interface ILookupComponentProps extends ITagPickerProps {
    onGetOnCreateFormParameters?: () => { [key: string]: string } | undefined | Promise<{ [key: string]: string } | undefined>;
}

export interface ILookupParameters extends IBaseParameters {
    IsInlineNewEnabled?: Omit<ITwoOptionsProperty, 'attributes'>;
    MultipleEnabled?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    value: ILookupProperty;
}

export interface ILookupOutputs extends IOutputs {
    value?: ComponentFramework.LookupValue[]
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

export interface ILayout {
    Name: string;
    Object: number;
    Rows: IRow[];
    CustomControlDescriptions: any[];
    Jump: string;
    Select: boolean;
    Icon: boolean;
    Preview: boolean;
    IconRenderer: string;
}

export interface IUseLookupProps {
    onGetOnCreateFormParameters?: ILookupComponentProps['onGetOnCreateFormParameters'];
}

interface IRow {
    Name: string;
    Id: string;
    Cells: ICell[];
    MultiObjectIdField: string;
    LayoutStyle: string;
}

interface ICell {
    Name: string;
    Width: number;
    RelatedEntityName: string;
    IsHidden: boolean;
    ImageProviderWebresource: string;
    ImageProviderFunctionName: string;
    DisableSorting?: boolean;
    AddedBy?: string;
    Desc?: string;
    CellType?: string;
    DisableMetaDataBinding?: boolean;
    LabelId?: string;
}
