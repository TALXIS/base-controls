import { ITranslation } from "../../hooks";
import { IDatasetProperty, IParameters, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { IComponent, IOutputs } from "../../interfaces/context";
import { gridTranslations } from "./translations";


export interface IGrid extends IComponent<IGridParameters, IGridOutputs, Partial<ITranslation<typeof gridTranslations>>> {

}

export interface IEntityColumn extends ComponentFramework.PropertyHelper.DataSetApi.Column {
    isResizable?: boolean;
    isFilterable?: boolean;
    isEditable?: boolean;
    isRequired?: boolean;
}
export interface IEntityRecord extends ComponentFramework.PropertyHelper.DataSetApi.EntityRecord {
    setValue: (columnName: string, value: any) => void;
    save: () => Promise<void>;
}

export interface IGridParameters extends IParameters {
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableFiltering?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableSorting?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableOptionSetColors?:  Omit<ITwoOptionsProperty, 'attributes'>;
    UseContainerAsHeight?: Omit<ITwoOptionsProperty, 'attributes'>;
    InlineRibbonButtonIds?: IStringProperty;
    SelectableRows?: ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">;
    Grid: IDatasetProperty;
}

export interface IGridOutputs extends IOutputs {

}