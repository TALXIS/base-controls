/**
 * Ambient declarations handed to the Monaco editor of the live TaskGrid examples, so the snippet gets
 * IntelliSense for everything the sandbox injects. Hand-written on purpose — the same approach the
 * Form examples take — because the library's real `.d.ts` is not loaded into the editor.
 */
export const taskGridSandboxDeclarations = `
declare const React: typeof import('react');

interface IOptionSetOption {
    Value: number;
    Label: string;
    Color?: string;
}

interface ITaskGridColumn {
    name: string;
    displayName?: string;
    dataType?: string;
    isHidden?: boolean;
    metadata?: { OptionSet?: IOptionSetOption[]; [key: string]: any };
}

interface ITaskGridRecord {
    getRecordId(): string;
    getValue(columnName: string): any;
    getFormattedValue(columnName: string): string;
    setValue(columnName: string, value: any): void;
    /** Persists the record through the descriptor's strategy. The grid auto-saves, so call it after setValue. */
    save(): Promise<any>;
}

/** Props every cell renderer and cell editor receives. */
interface ITaskGridCellProps {
    /** The column the cell belongs to, including its metadata. */
    baseColumn?: ITaskGridColumn;
    /** The record behind the row. */
    record: ITaskGridRecord;
    /** \`value.value\` is the raw value; \`value.loading\` is true while it resolves. */
    value: { value: any; loading: boolean; error: boolean; [key: string]: any };
    /** True when the component is rendered as the cell's editor rather than its renderer. */
    isCellEditor: boolean;
    /** The AG Grid api. \`stopEditing()\` closes an editor once it has committed. */
    api?: { stopEditing(): void; refreshCells(params?: any): void; [key: string]: any };
    [key: string]: any;
}

interface ITaskGridComponents {
    /** Wraps the renderer of every data column. Call \`defaultRender(props)\` to keep the grid's own cell. */
    onRenderCellRenderer: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => JSX.Element) => JSX.Element;
    /** Wraps the editor of every editable data column. */
    onRenderCellEditor: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => JSX.Element) => JSX.Element;
    onRenderSkeleton: (props: any) => JSX.Element;
    onRenderCommandBar: (props: any) => JSX.Element;
}

/** The grid. \`pcfContext\` and \`taskGridDescriptor\` are supplied by the sandbox. */
declare const TaskGrid: (props: {
    pcfContext: any;
    taskGridDescriptor: any;
    components?: Partial<ITaskGridComponents>;
    labels?: Record<string, string>;
}) => JSX.Element;

/** The in-memory descriptor backing this example. Kept outside the snippet so edits do not reload the data. */
declare const descriptor: any;
/** The PCF context the docs provide. */
declare const pcfContext: any;

//Material UI components available in the sandbox
declare const Chip: typeof import('@mui/material').Chip;
declare const Stack: typeof import('@mui/material').Stack;
declare const Avatar: typeof import('@mui/material').Avatar;
declare const LinearProgress: typeof import('@mui/material').LinearProgress;
declare const Rating: typeof import('@mui/material').Rating;
declare const Slider: typeof import('@mui/material').Slider;
declare const TextField: typeof import('@mui/material').TextField;
declare const Tooltip: typeof import('@mui/material').Tooltip;
declare const Typography: typeof import('@mui/material').Typography;
`.trim()
