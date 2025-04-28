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
}

export interface IGrid extends IControl<IGridParameters, IGridOutputs, Partial<ITranslation<typeof gridTranslations>>, IGridComponentProps> {

}

export interface IGridParameters extends IParameters {
    EnableEditing?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnablePagination?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableFiltering?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableSorting?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableOptionSetColors?:  Omit<ITwoOptionsProperty, 'attributes'>;
    EnableChangeEditor?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableMultiEdit?: Omit<ITwoOptionsProperty, 'attributes'>;
    EnableZebra?: Omit<ITwoOptionsProperty, 'attributes'>;
    RowHeight?: Omit<IWholeNumberProperty, 'attributes'>;
    EnablePageSizeSwitcher?: Omit<ITwoOptionsProperty, 'attributes'>;
    Height?: IStringProperty;
    InlineRibbonButtonIds?: IStringProperty;
    SelectableRows?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"none" | "single" | "multiple">, 'type'>;
    Grid: IDataset
}

export interface IGridOutputs extends IOutputs {

}