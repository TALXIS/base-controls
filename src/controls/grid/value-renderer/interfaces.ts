import { IControl, IOutputs, IParameters, IStringProperty, ITwoOptionsProperty } from "@interfaces";
import { IAlignment } from "@utils";
import { IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import type { IGridCell, IGridRuntime } from "@controls/grid";
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
    /** Whether option set values are drawn as tags in their colours. */
    EnableOptionSetColors?: Omit<ITwoOptionsProperty, 'attributes'>;
    /** Whether the value stands for the record, drawn as a link to it where navigation is on. */
    IsPrimaryColumn?: Omit<ITwoOptionsProperty, 'attributes'>;
    /** Whether the value wraps onto as many lines as it needs. */
    IsMultiline?: Omit<ITwoOptionsProperty, 'attributes'>;
    Column: {
        raw: IColumn | undefined;
    }
    /** The cell this is drawn in: what it may do there and what it offers. */
    Cell: {
        raw: IGridCell | undefined;
    }
    /** Always the main provider, even when the cell is drawn by a child data provider. */
    Provider: {
        raw: IDataProvider;
    }
    Record: {
        raw: IRecord;
    }
    /** The grid the value is drawn in, which opens records. */
    Runtime: {
        raw: IGridRuntime;
    }
    PrefixIcon: IStringProperty;
    SuffixIcon: IStringProperty;
    /** Text shown when the cell has no value. Left unset, `---` is used. */
    Placeholder?: IStringProperty;
}

export interface IGridValueRenderer extends IControl<IGridValueRendererParameters, IOutputs, never, never> {
    components?: Partial<IGridValueRendererComponents>;
}
