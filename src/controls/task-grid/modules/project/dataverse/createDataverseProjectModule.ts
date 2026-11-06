import { createProjectModule, IProjectModule } from "../createProjectModule";
import { DataverseProjectStore } from "./DataverseProjectStore";

export interface IDataverseProjectModuleParameters {
    /** The project's table. */
    entityName: string;
    /** The project record's id. */
    id: string;
    /** Holds the project's start. */
    startDateColumn?: string;
    endDateColumn?: string;
    /** More columns to read into `data`, by name. */
    columns?: string[];
}

/** The project module for a project record in Dataverse. */
export const createDataverseProjectModule = (parameters: IDataverseProjectModuleParameters): IProjectModule => {
    return createProjectModule({ createStore: taskRuntime => new DataverseProjectStore(taskRuntime, parameters) });
};
