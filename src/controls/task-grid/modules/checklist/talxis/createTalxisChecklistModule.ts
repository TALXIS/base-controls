import { DataTypes } from "@talxis/client-libraries";
import type { ITaskRuntime } from "../../../runtime";
import type { ITaskDataProvider } from "../../../provider";
import type { IChecklist, IChecklistItem, IChecklistParameters, IChecklistStore } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";

const CHECKLIST_FIELD = 'talxis_checklistjson';

export interface ITalxisChecklistModuleParameters extends Omit<IChecklistParameters, 'onCreateStore'> { }

//the items come with the tasks, so nothing is fetched
class TalxisChecklistStore implements IChecklistStore {
    private _taskRuntime: ITaskRuntime;
    private _checklist: IChecklist;
    private _unregisters: (() => void)[] = [];

    constructor(taskRuntime: ITaskRuntime, checklist: IChecklist) {
        this._taskRuntime = taskRuntime;
        this._checklist = checklist;
        taskRuntime.services.whenAvailable('provider', this._onProviderAvailable);
    }

    public destroy(): void {
        this._unregisters.forEach(unregister => unregister());
    }

    private _onProviderAvailable = (provider: ITaskDataProvider): void => {
        //real, not virtual: a virtual column is never selected
        provider.registerRequiredColumn({ name: CHECKLIST_FIELD, displayName: CHECKLIST_FIELD, dataType: DataTypes.Multiple, isHidden: true, disableSorting: true, order: -1, visualSizeFactor: 100 });
        provider.taskEvents.addEventListener('onEditorClosed', this._onEditorClosed);
        this._unregisters.push(() => provider.taskEvents.removeEventListener('onEditorClosed', this._onEditorClosed));
    };

    //the editor may have changed the checklist
    private _onEditorClosed = (taskIds: string[]): void => {
        this._checklist.reload(taskIds);
    };

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
    return createChecklistModule({ ...parameters, onCreateStore: (taskRuntime, checklist) => new TalxisChecklistStore(taskRuntime, checklist) });
};
