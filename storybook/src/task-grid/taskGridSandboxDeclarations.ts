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
    /** The reference other records use to point at this one. */
    getNamedReference(): ITaskGridEntityReference;
    /** Persists the record through the descriptor's strategy. The grid auto-saves, so call it after setValue. */
    save(): Promise<any>;
}

/** What a lookup column's value holds: one entry per referenced record. */
interface ITaskGridEntityReference {
    id: { guid: string };
    name?: string;
    etn?: string;
    /** Whatever the strategy attached to the reference — an image url, a colour, anything. */
    rawData?: Record<string, any>;
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

/** One button of the ribbon's command bar, as the grid hands it over. */
interface ITaskGridCommandBarItem {
    key: string;
    text?: string;
    disabled?: boolean;
    iconProps?: { iconName?: string };
    onClick?: (event?: any) => void;
    /** Present when the item renders its own button, e.g. the one that owns the Edit columns panel. */
    onRender?: (item: ITaskGridCommandBarItem) => JSX.Element;
    subMenuProps?: {
        items?: ITaskGridCommandBarItem[];
        /** Present when the submenu is a panel of its own, e.g. the settings callout or the template picker. */
        onRenderMenuList?: (...args: any[]) => JSX.Element;
    };
    [key: string]: any;
}

interface ITaskGridCommandBarProps {
    items?: ITaskGridCommandBarItem[];
    farItems?: ITaskGridCommandBarItem[];
    [key: string]: any;
}

interface ITaskGridComponents {
    /** Wraps the renderer of every data column. Call \`defaultRender(props)\` to keep the grid's own cell. */
    onRenderCellRenderer: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => JSX.Element) => JSX.Element;
    /** Wraps the editor of every editable data column. */
    onRenderCellEditor: (props: ITaskGridCellProps, defaultRender: (props: ITaskGridCellProps) => JSX.Element) => JSX.Element;
    onRenderSkeleton: (props: any) => JSX.Element;
    /** Replaces the ribbon's command bar outright — there is no defaultRender to delegate to. */
    onRenderCommandBar: (props: ITaskGridCommandBarProps) => JSX.Element;
}

/** The grid. \`pcfContext\` and \`taskGridDescriptor\` are supplied by the sandbox. */
declare const TaskGrid: (props: {
    pcfContext: any;
    taskGridDescriptor: any;
    components?: Partial<ITaskGridComponents>;
    labels?: Record<string, string>;
}) => JSX.Element;

/** The in-memory descriptor backing this example. Kept outside the snippet so edits do not reload the data. */
declare const descriptor: {
    /** Builds the candidate provider for a lookup-many column - the records its picker offers. */
    onCreateLookupManyDataProvider?: (params: { record: ITaskGridRecord; column: ITaskGridColumn }) => {
        refresh(): Promise<any>;
        getRecords(): ITaskGridRecord[];
        [key: string]: any;
    };
    [key: string]: any;
};
/** The PCF context the docs provide. */
declare const pcfContext: any;

/** Reaches the provider backing the grid this component renders in. */
declare const useTaskDataProvider: () => {
    getRecords(): ITaskGridRecord[];
    getRecordsMap(): Record<string, ITaskGridRecord>;
    getSelectedRecordIds(): string[];
    clearSelectedRecordIds(): void;
    /** Saves the given records, or every dirty record when called with no argument. */
    save(records?: ITaskGridRecord[]): Promise<any[]>;
    getColumns(): ITaskGridColumn[];
    refresh(): Promise<any>;
    [key: string]: any;
};

//Material UI components available in the sandbox
declare const Chip: typeof import('@mui/material').Chip;
declare const Stack: typeof import('@mui/material').Stack;
declare const Autocomplete: typeof import('@mui/material').Autocomplete;
declare const Avatar: typeof import('@mui/material').Avatar;
declare const AvatarGroup: typeof import('@mui/material').AvatarGroup;
declare const LinearProgress: typeof import('@mui/material').LinearProgress;
declare const Rating: typeof import('@mui/material').Rating;
declare const Slider: typeof import('@mui/material').Slider;
declare const Snackbar: typeof import('@mui/material').Snackbar;
declare const Alert: typeof import('@mui/material').Alert;
declare const Button: typeof import('@mui/material').Button;
//Material icons for the commands the ribbon ships with
declare const AddIcon: typeof import('@mui/icons-material/Add').default;
declare const DoneAllIcon: typeof import('@mui/icons-material/DoneAll').default;
declare const DeleteIcon: typeof import('@mui/icons-material/Delete').default;
declare const EditIcon: typeof import('@mui/icons-material/Edit').default;
declare const PlaylistAddIcon: typeof import('@mui/icons-material/PlaylistAdd').default;
declare const SettingsIcon: typeof import('@mui/icons-material/Settings').default;
declare const ViewColumnIcon: typeof import('@mui/icons-material/ViewColumn').default;
declare const Menu: typeof import('@mui/material').Menu;
declare const Popover: typeof import('@mui/material').Popover;
declare const MenuItem: typeof import('@mui/material').MenuItem;
declare const TextField: typeof import('@mui/material').TextField;
declare const Tooltip: typeof import('@mui/material').Tooltip;
declare const Typography: typeof import('@mui/material').Typography;
`.trim()
