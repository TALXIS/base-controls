import type { IColumn } from "@talxis/client-libraries";

/** A column as a view declares it, with what it leaves out filled in from its definition. */
export const mergeColumn = (definition: IColumn, declared: IColumn): IColumn => ({
    ...definition,
    ...declared,
    metadata: { ...definition.metadata, ...declared.metadata },
});
