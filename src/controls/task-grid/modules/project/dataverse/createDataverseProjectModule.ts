import dayjs from "dayjs";
import type { ITaskRuntime } from "../../../runtime";
import { createProjectModule, IProjectModule } from "../createProjectModule";
import type { IProjectData, IProjectStore } from "../Project";

export interface IDataverseProjectModuleParameters {
    /** The project's table. */
    entityName: string;
    /** The project record's id. */
    id: string;
    /** Holds the project's start; no start without it. */
    startDateColumn?: string;
    endDateColumn?: string;
    /** More columns to read into `data`, by name. */
    columns?: string[];
}

class DataverseProjectStore implements IProjectStore {
    private _taskRuntime: ITaskRuntime;
    private _parameters: IDataverseProjectModuleParameters;

    constructor(taskRuntime: ITaskRuntime, parameters: IDataverseProjectModuleParameters) {
        this._taskRuntime = taskRuntime;
        this._parameters = parameters;
    }

    public async onLoadProject(): Promise<IProjectData> {
        const { entityName, id, startDateColumn, endDateColumn, columns = [] } = this._parameters;
        const pcfContext = this._taskRuntime.services.get('pcfContext');
        const nameColumn = (await pcfContext.utils.getEntityMetadata(entityName, [])).PrimaryNameAttribute;
        const select = [nameColumn, startDateColumn, endDateColumn, ...columns].filter((column): column is string => !!column);
        const record = await pcfContext.webAPI.retrieveRecord(entityName, id, `?$select=${select.join(',')}`);
        return {
            id,
            name: record[nameColumn],
            entityName,
            startDate: startDateColumn ? this._toDate(record[startDateColumn]) : undefined,
            endDate: endDateColumn ? this._toDate(record[endDateColumn]) : undefined,
            data: Object.fromEntries(columns.map(column => [column, record[column]])),
        };
    }

    private _toDate(value: string | null | undefined) {
        return value ? dayjs(value) : undefined;
    }
}

/** The project module for a project record in Dataverse. */
export const createDataverseProjectModule = (parameters: IDataverseProjectModuleParameters): IProjectModule => {
    return createProjectModule({ onCreateStore: taskRuntime => new DataverseProjectStore(taskRuntime, parameters) });
};
