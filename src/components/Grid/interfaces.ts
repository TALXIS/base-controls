import { AgGridReactProps } from "@ag-grid-community/react";
import { ITranslation } from "../../hooks";
import { IParameters, IStringProperty, ITwoOptionsProperty, IWholeNumberProperty } from "../../interfaces";
import { IControl, IOutputs } from "../../interfaces/context";
import { gridTranslations } from "./translations";
import { IDataset } from "@talxis/client-libraries";

export interface IGridComponentProps {
    agGrid: AgGridReactProps;
    registerRowGroupingModule: boolean;
    container: any;
    pagingProps: any;
    licenseKey?: string;
}

export interface IGrid extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof gridTranslations>>, IGridComponentProps> {

}

export interface IGridParameters extends IParameters {
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableFiltering?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableSorting?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableQuickFind?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableOptionSetColors?:  Omit<ITwoOptionsProperty, 'attributes'>;
    ShowRecordCount?: Omit<ITwoOptionsProperty, 'attributes'>;
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
    GroupType?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"nested" | "flat">, 'type'>;
    SelectableRows?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">, 'type'>;
    LicenseKey?: IStringProperty;
    Grid: IDataset
}

export interface IGridOutputs extends IOutputs {

}