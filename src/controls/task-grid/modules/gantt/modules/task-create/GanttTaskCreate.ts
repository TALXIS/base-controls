import { createElement } from "react";
import type { IGantt } from "../../interfaces";
import type { IGanttSurface } from "../../surfaces";
import { runQuietly } from "../../../../runtime/runQuietly";
import { TaskCreateLayer } from "./components/adapters/task-create-layer";

/** The `taskCreate` module: Ctrl+drag over the timeline draws a new task. */
export interface IGanttTaskCreate {
    /** Whether tasks can be created at all. */
    isEnabled(): boolean;
    /** Creates a task above the row's task, under the same parent. */
    create(rowTaskId: string, startDate: Date, endDate: Date): Promise<void>;
    /** Called as the Gantt goes. */
    destroy(): void;
}

export class GanttTaskCreate implements IGanttTaskCreate {
    private _gantt: IGantt;
    private _unregisterSurface: () => void;

    constructor(gantt: IGantt) {
        this._gantt = gantt;
        this._unregisterSurface = gantt.surfaces.registerSurface(this._onSurfaces);
    }

    public isEnabled(): boolean {
        return this._gantt.getTaskRuntime().isCreationEnabled();
    }

    public async create(rowTaskId: string, startDate: Date, endDate: Date): Promise<void> {
        const taskRuntime = this._gantt.getTaskRuntime();
        const structure = taskRuntime.getProvider().getRecordTree().structure;
        const dates = this._gantt.services.get('dates');
        await runQuietly(() => taskRuntime.tasks.create(structure.getParent(rowTaskId)?.getRecordId(), {
            previousTaskId: structure.getNeighbours(rowTaskId).previous?.getRecordId(),
            nextTaskId: rowTaskId,
            data: { [dates.getStartColumnName()]: startDate, [dates.getEndColumnName()]: endDate },
        }));
    }

    public destroy(): void {
        this._unregisterSurface();
    }

    private _onSurfaces = (surfaces: IGanttSurface[]): void => {
        surfaces.push({ key: 'taskCreate', onRender: () => createElement(TaskCreateLayer) });
    };
}

declare module "../../interfaces" {
    interface IGanttModuleMap {
        /** Drawing new tasks on the timeline. */
        taskCreate: IGanttTaskCreate;
    }
}
