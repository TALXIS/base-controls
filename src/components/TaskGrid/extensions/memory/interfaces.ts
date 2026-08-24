import { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";

/**
 * An in-memory entity used as a data source by the memory extension — the task entity itself,
 * task templates, or the candidate list behind a lookup-many column.
 */
export interface IMemoryEntitySource {
    /**
     * The records. How much of a write reaches this array depends on what consumes it: the template
     * provider appends to it, a lookup-many provider only ever reads a copy of it, and the task provider
     * writes edits and moves through to these record objects while keeping creations and deletions in a
     * copy of its own.
     *
     * Pass a `structuredClone` of a shared fixture if two grids need to stay independent.
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
