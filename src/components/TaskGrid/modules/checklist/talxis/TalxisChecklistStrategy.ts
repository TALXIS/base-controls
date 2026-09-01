import { DataTypes } from "@talxis/client-libraries";
import { IChecklistItem, IChecklistStrategy } from "../ChecklistProvider";
import type { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { applyColumn } from "@components/TaskGrid/providers/saved-query";

/** The field each task carries its whole checklist in, as a JSON array. */
const CHECKLIST_FIELD = 'talxis_checklistjson';

export interface ITalxisChecklistStrategyParams {
    /** Where the task side is reached: the column is added to it, and the records are read off it. */
    services: ITaskGridServiceLocator;
}

/**
 * {@link IChecklistStrategy} for the Talxis platform: each task carries its whole checklist as JSON in one
 * field, so there is nothing to query — the items come off the task records the grid already loaded.
 *
 * The module's own checklist column is virtual and is therefore never fetched, so this registers a real
 * hidden column for the JSON field on every saved query. That is what makes the value arrive.
 *
 * On top of that it reloads a task whose form was just closed, because on this platform the form is where
 * checklists are edited.
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
        this._registerEventListeners();
    }

    public async onGetChecklistItems({ taskIds }: { taskIds: string[] }): Promise<Record<string, IChecklistItem[]>> {
        const records = this._services.get('taskDataProvider').getRecordsMap();
        //a task with no record loaded has nothing to read, and no items is a legitimate answer for it
        return Object.fromEntries(taskIds.map(taskId => [taskId, this._getItems(records[taskId]?.getValue(CHECKLIST_FIELD))]));
    }

    //reloads a task's checklist when its form closes. The form is where it is edited here, so the items the grid parsed
    //when the row loaded are stale the moment it is closed. A refresh is all it takes: the task record is fetched again
    //as the form closes and its new field value is on the record before this runs, so re-reading it is what the
    //provider does anyway. What the provider holds is the parsed items, and nothing else reparses them. Waits for the
    //task provider rather than resolving it: the grid builds its modules first, so there is nothing to reach at
    //construction.
    private _registerEventListeners(): void {
        this._services.whenAvailable('taskDataProvider', ({ taskEvents }) => {
            taskEvents.addEventListener('onAfterDatasetItemsOpened', async (entityReferences, isTaskEntity) => {
                //a lookup cell opens a related record, whose ids are not task ids
                if (!isTaskEntity || entityReferences.length === 0) {
                    return;
                }
                //the references, not the result: a form can come back reporting nothing updated, and a null
                //result is the normal case rather than a failure
                const taskIds = entityReferences.map(reference => reference.id.guid);
                await this._services.get('checklistModule').provider.refresh(taskIds);
            });
        });
    }

    //puts the JSON field on every view. A field no view carries is a field the read never selects, which is the only
    //reason this column exists — nothing displays it.
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

    //reads one task's stored blob. The field holds either nothing, for a task with no checklist, or the JSON array — so
    //there is nothing to validate: a field holding anything else is a data problem, and failing loudly says so better
    //than a silent empty list would. The stored items are the grid's own shape, so there is nothing to map either.
    private _getItems(value: string | undefined): IChecklistItem[] {
        if (!value) {
            return [];
        }
        return JSON.parse(value);
    }
}
