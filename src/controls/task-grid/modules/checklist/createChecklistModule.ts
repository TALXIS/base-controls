import { ColDef } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { TASK_TREE_PRIORITY } from "@controls/task-grid/module";
import { ITaskGridFeature } from "../interfaces";
import { CHECKLIST_COLUMN_NAME, ChecklistProvider, IChecklistStrategy } from "./ChecklistProvider";
import { ChecklistCell } from "./checklist-cell";

/** Options for {@link createChecklistModule}. */
export interface IChecklistModuleOptions {
    /** Returns where the checklist items are read from. Called once per mount. */
    onCreateStrategy: (params: ITaskGridFactoryParams) => IChecklistStrategy;
}

const onColumnDefinitions = (columnDefs: ColDef<IRecord>[]): void => {
    const colDef = columnDefs.find(colDef => colDef.colId === CHECKLIST_COLUMN_NAME);
    if (colDef) {
        colDef.cellRenderer = ChecklistCell;
        colDef.editable = false;
        colDef.context = { ...colDef.context, isLocked: true };
    }
};

/**
 * Builds the checklist module: you supply where checklist items are read from, this brings the provider
 * the grid asks per task and the column that shows them.
 *
 * Pass it as `features.checklist`. The grid registers it as `checklistModule`.
 *
 * @example
 * ```ts
 * features={{
 *     checklist: createChecklistModule({
 *         onCreateStrategy: ({ services }) => new MemoryChecklistStrategy({ items: CHECKLIST_ITEMS, services }),
 *     }),
 * }}
 * ```
 */
export const createChecklistModule = (options: IChecklistModuleOptions): ITaskGridFeature => ({
    onInitialize: services => {
        const provider = new ChecklistProvider({ strategy: options.onCreateStrategy({ services }), services });
        services.register('checklistModule', () => ({ provider }));
    },
    onRegister: runtime => {
        runtime.services.get('columns').registerColumnDefinitions(onColumnDefinitions, TASK_TREE_PRIORITY + 1);
    },
});
