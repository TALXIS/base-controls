import { DataTypes } from "@talxis/client-libraries";
import { ChecklistItemStatus, IChecklistItem, IChecklistStrategy } from "../ChecklistProvider";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { applyColumn } from "@components/TaskGrid/providers/saved-query";

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
 * The module's own checklist column is virtual and is therefore never fetched, so this registers a real
 * hidden column for the JSON field on every saved query. That is what makes the value arrive.
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
        this._registerColumn();
    }

    public async onGetChecklistItems({ taskIds }: { taskIds: string[] }): Promise<IChecklistItem[]> {
        const records = this._services.get('taskDataProvider').getRecordsMap();
        //a task with no record loaded has nothing to read, and no items is a legitimate answer for it
        return taskIds.flatMap(taskId => this._getItems(taskId, records[taskId]?.getValue(CHECKLIST_FIELD)));
    }

    /**
     * Puts the JSON field on every view. A field no view carries is a field the read never selects, which is
     * the only reason this column exists — nothing displays it.
     */
    private _registerColumn(): void {
        this._services.whenAvailable('savedQueryDataProvider', provider => {
            provider.registerHook(query => applyColumn(query, {
                name: CHECKLIST_FIELD,
                dataType: DataTypes.Multiple,
                displayName: CHECKLIST_FIELD,
                //real, not virtual: isVirtual is exactly what keeps a column out of the attributes
                isHidden: true,
                disableSorting: true,
            }));
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
