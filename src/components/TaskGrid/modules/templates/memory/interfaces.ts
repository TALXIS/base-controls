import { IRawRecord } from "@talxis/client-libraries";
import { IMemoryEntitySource } from "@components/TaskGrid/descriptors/memory/interfaces";

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
