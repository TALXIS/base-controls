import dayjs from "dayjs";
import { createProjectModule, IProjectModule } from "../createProjectModule";

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

/** The project module for a project record in Dataverse. */
export const createDataverseProjectModule = (parameters: IDataverseProjectModuleParameters): IProjectModule => {
    const { entityName, id, startDateColumn, endDateColumn, columns = [] } = parameters;

    const toDate = (value: string | null | undefined) => value ? dayjs(value) : undefined;

    return createProjectModule({
        onLoadProject: async taskDatasetControl => {
            const pcfContext = taskDatasetControl.services.get('pcfContext');
            const nameColumn = (await pcfContext.utils.getEntityMetadata(entityName, [])).PrimaryNameAttribute;
            const select = [nameColumn, startDateColumn, endDateColumn, ...columns].filter((column): column is string => !!column);
            const record = await pcfContext.webAPI.retrieveRecord(entityName, id, `?$select=${select.join(',')}`);
            return {
                id,
                name: record[nameColumn],
                entityName,
                startDate: startDateColumn ? toDate(record[startDateColumn]) : undefined,
                endDate: endDateColumn ? toDate(record[endDateColumn]) : undefined,
                data: Object.fromEntries(columns.map(column => [column, record[column]])),
            };
        },
    });
};
