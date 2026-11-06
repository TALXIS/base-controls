import { DataTypes } from "@talxis/client-libraries";
import type { ITaskRuntime } from "../../../runtime";
import type { ITaskDataProvider } from "../../../runtime/provider";
import type { ITaskChecklistItem, ITaskChecklistStore } from "../TaskChecklist";

const CHECKLIST_FIELD = 'talxis_checklistjson';

//the items come with the tasks
export class TalxisTaskChecklistStore implements ITaskChecklistStore {
    private _taskRuntime: ITaskRuntime;

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime;
        taskRuntime.services.observe('provider', this._onProviderAvailable);
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        //a virtual column is never selected
        return provider.addRequiredColumn({ name: CHECKLIST_FIELD, displayName: CHECKLIST_FIELD, dataType: DataTypes.Multiple, isHidden: true, disableSorting: true, order: -1, visualSizeFactor: 100 });
    };

    public async loadItems(taskIds: string[]): Promise<Map<string, ITaskChecklistItem[]>> {
        const records = this._taskRuntime.getProvider().getRecordsMap();
        const items = new Map<string, ITaskChecklistItem[]>();
        for (const taskId of taskIds) {
            const json: string | null | undefined = records[taskId]?.getRawData()[CHECKLIST_FIELD];
            if (!json) {
                continue;
            }
            try {
                items.set(taskId, JSON.parse(json) as ITaskChecklistItem[]);
            }
            catch {
                continue;
            }
        }
        return items;
    }
}
