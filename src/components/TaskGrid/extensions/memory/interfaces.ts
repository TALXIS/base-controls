import { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";

/**
 * An in-memory entity used as a data source by the memory extension — the task entity itself,
 * task templates, or the candidate list behind a lookup-many column.
 */
export interface IMemoryEntitySource {
    /**
     * Seed records. Deep-cloned when the strategy initializes, so the array you pass in is never
     * mutated — the same fixture can safely back several grids or be returned from a cached
     * dynamic `import()`.
     */
    records: IRawRecord[];
    /** Column definitions, including hidden ones (primary id, parent lookup, stack rank, state code). */
    columns: IColumn[];
    /** Entity metadata. `PrimaryIdAttribute` is required; `LogicalName` and `QuickFindColumns` are recommended. */
    metadata: IMemoryProviderEntityMetadata;
}

/** A node in a template's task hierarchy, recreated by `onCreateTasksFromTemplate`. */
export interface IMemoryTaskTemplateNode {
    /**
     * Column values applied to the task created from this node, keyed by task column name — any
     * column of the task entity may be set. The primary id, parent lookup and stack rank are always
     * computed by the strategy and cannot be overridden here.
     */
    values: Partial<IRawRecord>;
    /** Nested child tasks, created recursively beneath this node. */
    children?: IMemoryTaskTemplateNode[];
}

/** The template entity, plus the child task hierarchy each template expands into. */
export interface IMemoryTemplateSource extends IMemoryEntitySource {
    /**
     * Child tasks per template, keyed by the template record's primary id value. Templates without
     * an entry expand to a single root task.
     */
    children?: Record<string, IMemoryTaskTemplateNode[]>;
}
