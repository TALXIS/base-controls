import { DataTypes } from "@talxis/client-libraries";
import type { ITaskRuntime } from "../../../runtime";
import type { ITaskDataProvider } from "../../../provider";
import type { IChecklistItem, IChecklistStore } from "../Checklist";

const CHECKLIST_FIELD = 'talxis_checklistjson';

//the items come with the tasks
export class TalxisChecklistStore implements IChecklistStore {
    private _taskRuntime: ITaskRuntime;

    constructor(taskRuntime: ITaskRuntime) {
        this._taskRuntime = taskRuntime;
        taskRuntime.services.observe('provider', this._onProviderAvailable);
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): (() => void) => {
        //a virtual column is never selected
        return provider.registerRequiredColumn({ name: CHECKLIST_FIELD, displayName: CHECKLIST_FIELD, dataType: DataTypes.Multiple, isHidden: true, disableSorting: true, order: -1, visualSizeFactor: 100 });
    };

    public async onLoadItems(taskIds: string[]): Promise<Map<string, IChecklistItem[]>> {
        const records = this._taskRuntime.getProvider().getRecordsMap();
        const items = new Map<string, IChecklistItem[]>();
        for (const taskId of taskIds) {
            const json: string | null | undefined = records[taskId]?.getRawData()[CHECKLIST_FIELD];
            if (!json) {
                continue;
            }
            try {
                items.set(taskId, JSON.parse(json) as IChecklistItem[]);
            }
            catch {
                continue;
            }
        }
        return items;
    }
}
