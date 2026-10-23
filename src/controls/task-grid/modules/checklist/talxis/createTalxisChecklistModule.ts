import type { ITaskRuntime } from "../../../runtime";
import type { IChecklistItem, IChecklistParameters, IChecklistStore } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";

const CHECKLIST_FIELD = 'talxis_checklistjson';

export interface ITalxisChecklistModuleParameters extends Omit<IChecklistParameters, 'onCreateStore'> { }

//the items come with the tasks, so nothing is fetched
class TalxisChecklistStore implements IChecklistStore {
    private _taskRuntime: ITaskRuntime;

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime;
    }

    public async onLoadItems(taskIds: string[]): Promise<Map<string, IChecklistItem[]>> {
        const records = this._taskRuntime.getProvider().getRecordsMap();
        const items = new Map<string, IChecklistItem[]>();
        for (const taskId of taskIds) {
            const json: string | null | undefined = records[taskId]?.getRawData()[CHECKLIST_FIELD];
            if (json) {
                items.set(taskId, JSON.parse(json) as IChecklistItem[]);
            }
        }
        return items;
    }
}

/** Checklists stored as JSON on each TALXIS task. */
export const createTalxisChecklistModule = (parameters: ITalxisChecklistModuleParameters = {}): IChecklistModule => {
    return createChecklistModule({ ...parameters, onCreateStore: taskRuntime => new TalxisChecklistStore(taskRuntime) });
};
