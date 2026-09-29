import { IControl, IOutputs, IParameters, IStringProperty, ITwoOptionsProperty } from "@interfaces";
import { IAlignment } from "@utils";
import { IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import type { IGridCell } from "@controls/grid";
import { IGridValueRendererComponents } from "./components";

/** A file or an image, as a record holds one. */
export interface IFileValue {
    fileName: string;
    /** In bytes, where the host reported one. */
    fileSize?: number;
    /** Where the contents can be fetched from. */
    fileUrl?: string;
    /** A picture of the contents, where the host built one. */
    thumbnailUrl?: string;
    mimeType?: string;
}

export interface IGridValueRendererParameters extends IParameters {
    value: any;
    ColumnAlignment: Omit<ComponentFramework.PropertyTypes.EnumProperty<IAlignment>, 'type'>;
    CellType: Omit<ComponentFramework.PropertyTypes.EnumProperty<'renderer' | 'editor'>, 'type'>;
    EnableNavigation: Omit<ITwoOptionsProperty, 'attributes'>;
    Column: {
        raw: IColumn | undefined;
    }
    /** The cell this is drawn in: what it may do there and what it offers. */
    Cell: {
        raw: IGridCell | undefined;
    }
    /** Always the main dataset, even when the cell is drawn by a child data provider. */
    Dataset: {
        raw: IDataset;
    }
    Record: {
        raw: IRecord;
    }
    PrefixIcon: IStringProperty;
    SuffixIcon: IStringProperty;
    /** Text shown when the cell has no value. Left unset, `---` is used. */
    Placeholder?: IStringProperty;
}

export interface IGridValueRenderer extends IControl<IGridValueRendererParameters, IOutputs, never, never> {
    components?: Partial<IGridValueRendererComponents>;
}
