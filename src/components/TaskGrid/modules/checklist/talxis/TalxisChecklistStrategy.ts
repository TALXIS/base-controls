import { DataTypes } from "@talxis/client-libraries";
import { ChecklistItemStatus, IChecklistItem, IChecklistStrategy } from "../ChecklistProvider";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";

/** The field each task carries its whole checklist in, as a JSON array. */
const CHECKLIST_FIELD = 'talxis_checklist';

/** Constructor parameters for {@link TalxisChecklistStrategy}. */
export interface ITalxisChecklistStrategyParams {
    /** Where the task side is reached: the column is added to it, and the records are read off it. */
    services: ITaskGridServiceLocator;
}

/**
 * One item as the JSON stores it: an id, a name, its position and its status.
 *
 * A well-formed blob carries every field but `status`, where absent means `active`.
 *
 * `stackrank` is declared as part of the shape but not carried into the grid — nothing displays a checklist
 * as a list yet, so there is nothing for it to order. Typed as a string to match the grid's own
 * `stackrank`, which is a LexoRank rather than an index.
 */
interface IStoredChecklistItem {
    id: string;
    name: string;
    stackrank: string;
    /** Absent counts as `active`: an item nobody has ticked is one still to do. */
    status?: string;
}

/**
 * {@link IChecklistStrategy} for the Talxis platform: each task carries its whole checklist as JSON in one
 * field, so there is nothing to query — the items come off the task records the grid already loaded.
 *
 * The module's own checklist column is virtual and is therefore never fetched, so this adds a real hidden
 * column for the JSON field to the task provider before the load. That is what makes the value arrive.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetChecklistModule: ({ services }) => createChecklistModule({
 *         strategy: new TalxisChecklistStrategy({ services }),
 *         services,
 *     }),
 * }
 * ```
 */
export class TalxisChecklistStrategy implements IChecklistStrategy {
    private _services: ITaskGridServiceLocator;

    constructor(params: ITalxisChecklistStrategyParams) {
        this._services = params.services;
        this._registerEventListeners();
    }

    public async onGetChecklistItems({ taskIds }: { taskIds: string[] }): Promise<IChecklistItem[]> {
        const records = this._services.get('taskDataProvider').getRecordsMap();
        //a task the grid has not loaded has nothing to read, which is not an error: a refresh can name a
        //task that has since gone, and the provider treats an empty answer as "this task has none"
        return taskIds.flatMap(taskId => this._getItems(taskId, records[taskId]?.getValue(CHECKLIST_FIELD)));
    }

    /**
     * Adds the JSON field to what the grid fetches. The attributes come from the provider's columns, and
     * the module is built before the task load, so appending here is what makes the value arrive at all —
     * the module's own `checklist__virtual` column is virtual and is never selected.
     */
    private _registerEventListeners(): void {
        this._services.whenAvailable('taskDataProvider', provider => {
            const columns = provider.getColumns();
            //a view may already name it; adding it twice would duplicate the attribute
            if (columns.some(column => column.name === CHECKLIST_FIELD)) {
                return;
            }
            provider.setColumns([...columns, {
                name: CHECKLIST_FIELD,
                dataType: DataTypes.Multiple,
                displayName: CHECKLIST_FIELD,
                //carried for this strategy to read, not for anyone to look at
                isHidden: true,
                disableSorting: true,
            }]);
        });
    }

    /**
     * Reads one task's stored blob. The field holds either nothing, for a task with no checklist, or the
     * JSON array — so there is nothing to validate: a field holding anything else is a data problem, and
     * failing loudly says so better than a silent empty list would.
     */
    private _getItems(taskId: string, value: string | undefined): IChecklistItem[] {
        if (!value) {
            return [];
        }
        const stored: IStoredChecklistItem[] = JSON.parse(value);
        return stored.map(item => ({
            id: item.id,
            taskId: taskId,
            name: item.name,
            status: this._getStatus(item.status),
        }));
    }

    //taken on trust: the stored status comes from an option set, so whatever is there is one the grid knows
    private _getStatus(status: string | undefined): ChecklistItemStatus {
        return (status ?? 'active') as ChecklistItemStatus;
    }
}
