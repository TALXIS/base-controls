import { AgGridReactProps } from "@ag-grid-community/react";
import { ITranslation } from "../../hooks";
import { IParameters, IStringProperty, ITwoOptionsProperty, IWholeNumberProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { gridTranslations } from "./translations";
import { IDataset } from "@talxis/client-libraries";


export interface IGrid extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof gridTranslations>>, AgGridReactProps> {

}

export interface IGridParameters extends IParameters {
    Grid: IDataset;
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableFiltering?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableSorting?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableQuickFind?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableRecordCount?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableChangeEditor?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableMultiEdit?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableZebra?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableGrouping?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableAggregation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableGroupedColumnsPinning?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableCommandBar?: Omit<ITwoOptionsProperty, 'attributes'>;
    RowHeight?: Omit<IWholeNumberProperty, 'attributes'>;
    EnablePageSizeSwitcher?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableAutoSave?: Omit<ITwoOptionsProperty, 'attributes'>;
    DefaultExpandedGroupLevel?: Omit<IWholeNumberProperty, 'attributes'>;
    
    Height?: IStringProperty;
    InlineRibbonButtonIds?: IStringProperty;
    GroupingType?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"nested" | "flat">, 'type'>;
    SelectableRows?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">, 'type'>;
    LicenseKey?: IStringProperty;
}

export interface IGridOutputs extends IOutputs {

}