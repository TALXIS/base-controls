import { IControl, IOutputs, IParameters, IStringProperty, ITwoOptionsProperty } from "@interfaces";
import { IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import { IGridCellRendererComponents } from "./components";

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

export interface IGridCellRendererParameters extends IParameters {
    value: any;
    ColumnAlignment: Omit<ComponentFramework.PropertyTypes.EnumProperty<'left' | 'center' | 'right'>, 'type'>;
    CellType: Omit<ComponentFramework.PropertyTypes.EnumProperty<'renderer' | 'editor'>, 'type'>;
    EnableNavigation: Omit<ITwoOptionsProperty, 'attributes'>;
    Column: {
        raw: IColumn;
    }
    /**
     * This dataset instance is always the main dataset, even if the current cell is being rendered via a child data provider.
     * You can access the child DataProvider via the `getDataProvider()` method on the record instance.
     */
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

export interface IGridCellRenderer extends IControl<IGridCellRendererParameters, IOutputs, never, never> {
    components?: Partial<IGridCellRendererComponents>;
}
