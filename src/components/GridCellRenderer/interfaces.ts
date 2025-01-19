import { IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import { IControl, IParameters, IStringProperty, ITwoOptionsProperty } from "../../interfaces";
import { getDefaultGridRendererTranslations } from "./translations";

export interface IGridCellRenderer extends IControl<IGridCellRendererParameters, {}, ReturnType<typeof getDefaultGridRendererTranslations>, any> {
}

export interface IGridCellRendererParameters extends IParameters {
    value: any;
    ColumnAlignment?: Omit<ComponentFramework.PropertyTypes.EnumProperty<"left" | "center" | "right">, 'type'>;
    EnableNavigation?: Omit<ITwoOptionsProperty, 'attributes'>;
    PrefixIcon?: IStringProperty;
    SuffixIcon?: IStringProperty
    Column: IColumn
    Dataset: IDataset;
    //@ts-ignore - typings
    Record: IRecord
}