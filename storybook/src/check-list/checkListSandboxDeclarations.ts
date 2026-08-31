/**
 * Ambient declarations handed to the Monaco editor of the live CheckList examples, so the snippet gets
 * IntelliSense for everything the sandbox injects. Hand-written on purpose — the same approach the Task
 * Grid and Form examples take — because the library's real `.d.ts` is not loaded into the editor.
 */
export const checkListSandboxDeclarations = `
declare const React: typeof import('react');

interface ICheckListRawRecord {
    [columnName: string]: any;
}

interface ICheckListOptionSetOption {
    Value: number;
    Label: string;
    Color?: string;
}

interface ICheckListColumn {
    /** Column name, matching the key on the raw records. */
    name: string;
    /** One of the library's data types, such as 'SingleLine.Text', 'OptionSet' or 'TwoOptions'. */
    dataType: string;
    /** Header text. Falls back to the column name. */
    displayName?: string;
    /** Starting width, in pixels. */
    visualSizeFactor?: number;
    metadata?: { OptionSet?: ICheckListOptionSetOption[]; [key: string]: any };
    [key: string]: any;
}

/** Which columns carry the id, the label, the order and the completion state. */
interface ICheckListFieldMapping {
    id: string;
    name: string;
    stackRank: string;
    /** A TwoOptions column. Hidden from the grid — the checkbox column is what shows it. */
    completed: string;
}

/** What onInitialize returns. */
interface ICheckListInitializeResult {
    data: ICheckListRawRecord[];
    columns: ICheckListColumn[];
    fieldMapping: ICheckListFieldMapping;
}

interface ICheckListSaveResult {
    recordId: string;
    success: boolean;
    fields: string[];
}

interface ICheckListEventEmitter {
    addEventListener(event: string, callback: (...args: any[]) => void): void;
    removeEventListener(event: string, callback: (...args: any[]) => void): void;
}

/** The handle onReady hands over. */
interface ICheckListApi {
    /** The items as they were last saved. An edit that has not been saved is not in here. */
    getData(): ICheckListRawRecord[];
    /** The same events as the props, to subscribe to imperatively. */
    getEvents(): ICheckListEventEmitter;
}

interface ICheckListProps {
    onInitialize: () => Promise<ICheckListInitializeResult> | ICheckListInitializeResult;
    /** Any subset of the UI strings. */
    labels?: { [key: string]: string };
    /** A fixed height such as '400px', or '100%'. Unset, the list is as tall as its items. */
    height?: string;
    /** How many items to grow to before scrolling. Defaults to 15. */
    maxVisibleRows?: number;
    /** Height of one item's row, in pixels. Defaults to 42. */
    rowHeight?: number;
    /**
     * Whether items can be changed. Defaults to true. Off, the list is read-only: no new-item row, no
     * delete button, no reordering, and the checkbox only reports.
     */
    enableEditing?: boolean;
    /** Whether rows alternate their background. Defaults to false. */
    enableZebra?: boolean;
    /** Whether option-set values render as coloured pills. Defaults to true. */
    enableOptionSetColors?: boolean;
    /** Whether the primary column's value is a link that opens the record. Defaults to true. */
    enableNavigation?: boolean;
    controlId?: string;
    licenseKey?: string;
    onReady?: (api: ICheckListApi) => void;
    onItemCreated?: (item: ICheckListRawRecord) => void;
    onItemDeleted?: (itemId: string) => void;
    onItemMoved?: (itemId: string) => void;
    onItemCompletionChanged?: (itemId: string, isCompleted: boolean) => void;
    onItemSaved?: (result: ICheckListSaveResult) => void;
    onDataChanged?: (items: ICheckListRawRecord[]) => void;
    onError?: (error: any, message: string) => void;
}

/** A checklist over any collection of records. */
declare const CheckList: (props: ICheckListProps) => JSX.Element;

/** The example's items. Kept across edits, so the list is where you left it. */
declare const rows: ICheckListRawRecord[];
/** The four columns the field mapping points at. Spread it to add your own. */
declare const columns: ICheckListColumn[];
/** The field mapping over those columns. */
declare const fieldMapping: ICheckListFieldMapping;
`
