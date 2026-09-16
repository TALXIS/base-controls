import { IControl, IOutputs, IParameters, IStringProperty, ITwoOptionsProperty } from "@interfaces";
import { IAlignment } from "@utils";
import { IColumn, IDataset, IRecord } from "@talxis/client-libraries";
import type { GridCell } from "@components/Grid";
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
    ColumnAlignment: Omit<ComponentFramework.PropertyTypes.EnumProperty<IAlignment>, 'type'>;
    CellType: Omit<ComponentFramework.PropertyTypes.EnumProperty<'renderer' | 'editor'>, 'type'>;
    EnableNavigation: Omit<ITwoOptionsProperty, 'attributes'>;
    Column: {
        raw: IColumn;
    }
    /**
     * The cell this is drawn in, which is what it may do there and what it offers.
     *
     * `raw` is `undefined` while the cell is being drawn for the first time, since the grid is told about a
     * cell once it is on screen.
     */
    Cell: {
        raw: GridCell | undefined;
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
