import type { IChecklistItem, IChecklistParameters } from "../Checklist";
import { createChecklistModule, IChecklistModule } from "../createChecklistModule";

const CHECKLIST_FIELD = 'talxis_checklistjson';

export interface ITalxisChecklistModuleParameters extends Omit<IChecklistParameters, 'onGetItems'> { }

/** Checklists stored as JSON on each TALXIS task. */
export const createTalxisChecklistModule = (parameters: ITalxisChecklistModuleParameters = {}): IChecklistModule => {
    return createChecklistModule({
        ...parameters,
        onGetItems: task => {
            const json: string | null | undefined = task.getRawData()[CHECKLIST_FIELD];
            return json ? JSON.parse(json) as IChecklistItem[] : [];
        },
    });
};
