import type { IColumn, IRawRecord } from "@talxis/client-libraries";
import type { IChecklistItem } from "@talxis/base-controls";
import { PRIMARY_ID, TASKS } from "./memoryTaskData";

const CHECKLIST_STEPS = ['Agree the scope', 'Draft the approach', 'Review with the team', 'Hand over the outcome'];

/** Two to four items on most tasks, ticked as far as the task's `percentcomplete`; every third task has none. */
export const createChecklistItems = (tasks: IRawRecord[]): Record<string, IChecklistItem[]> => {
    const items: Record<string, IChecklistItem[]> = {};
    tasks.forEach((task, index) => {
        if (index % 3 === 2) {
            return;
        }
        const taskId = task[PRIMARY_ID] as string;
        const total = 2 + index % 3;
        const completed = Math.round(((task.percentcomplete as number) ?? 0) / 100 * total);
        items[taskId] = CHECKLIST_STEPS.slice(0, total).map((name, step) => ({ id: `${taskId}-${step + 1}`, name, isCompleted: step < completed }));
    });
    return items;
};

/** The checklists of the sample tasks. */
export const CHECKLIST_ITEMS = createChecklistItems(TASKS);

/** The checklist column as a view lists it; the module fills in the rest. */
export const CHECKLIST_COLUMN: IColumn = { name: 'checklist__virtual', displayName: 'Checklist', dataType: 'SingleLine.Text', order: 0, visualSizeFactor: 100 };
