import { IAlignment } from "@core";
import { IControl, IOutputs, IParameters, IStringProperty, ITwoOptionsProperty } from "@pcf";
import type { IGridCell } from "../../runtime/cells";
import type { IGrid } from "../../runtime/grid";
import { IColumn, IDataProvider, IRecord } from "@talxis/client-libraries";
import { ICellUiValueRendererComponents } from "../../ui/value-renderer/components";

export interface IGridValueRendererParameters extends IParameters {
    value: { raw: any };
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
        raw: IGrid;
    }
    PrefixIcon: IStringProperty;
    SuffixIcon: IStringProperty;
    /** Text shown when the cell has no value. Left unset, `---` is used. */
    Placeholder?: IStringProperty;
}

export interface IGridValueRenderer extends IControl<IGridValueRendererParameters, IOutputs, never> {
    /** Put on the element the value is drawn in, alongside its own class. */
    className?: string;
    components?: Partial<ICellUiValueRendererComponents>;
}
