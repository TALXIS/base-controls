import { IControl, IParameters, IStringProperty, ITwoOptionsProperty } from "../../interfaces";

export interface IGridCellLabel extends IControl<IGridCellLabelParameters, {}, any, any> {
}

export interface IGridCellLabelParameters extends IParameters {
    value: IStringProperty;
    RenderAsLink?: Omit<ITwoOptionsProperty, 'attributes'>;
    Url?: IStringProperty;
}