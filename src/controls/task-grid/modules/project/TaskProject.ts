import type { ITaskDatasetControlRuntime } from "../../runtime";
import type { IProject } from "./createProjectModule";

/** The project a mount's tasks belong to, kept on its task runtime as `project`. */
export class TaskProject {
    constructor(taskDatasetControl: ITaskDatasetControlRuntime, project: IProject<unknown>) {
        taskDatasetControl.services.register('project', () => project);
    }
}
