import { IColumn, IDataset } from "@talxis/client-libraries";
import { IControl, IParameters, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { getDefaultGridRendererTranslations } from "./translations";

export interface IGridCellRenderer extends IControl<IGridCellRendererParameters, {}, ReturnType<typeof getDefaultGridRendererTranslations>, any> {
}

export interface IGridCellRendererParameters extends IParameters {
    value: any;
    ColumnAlignment: Omit<ComponentFramework.PropertyTypes.EnumProperty<"left" | "center" | "right">, 'type'>;
    EnableNavigation: Omit<ITwoOptionsProperty, 'attributes'>;
    Prefix?: IStringProperty;
    Suffix?: IStringProperty;
    Column: IColumn
    Dataset: IDataset;
    Record: any
}