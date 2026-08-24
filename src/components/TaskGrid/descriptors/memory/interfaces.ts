import { IColumn, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";

/**
 * An in-memory entity used as a data source by the memory implementations — the task entity itself,
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
