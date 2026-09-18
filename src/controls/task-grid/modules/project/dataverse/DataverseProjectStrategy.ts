import { ISingleRecord } from "@talxis/client-libraries";
import { IProject, IProjectStrategy } from "../ProjectProvider";

/**
 * What {@link DataverseProjectStrategy} puts in {@link IProject.data}: the project's own columns, plus the
 * table it lives in — which is what addressing the project in a lookup write takes, and what the grid's
 * platform-neutral `IProject` has no field for.
 */
export interface IDataverseProjectData {
    /** The project's logical entity name. */
    entityName: string;
    [columnName: string]: any;
}

/** A project resolved on Dataverse: the table it lives in is part of what it carries. */
export interface IDataverseProject extends IProject<IDataverseProjectData> {
    data: IDataverseProjectData;
}

/**
 * The project as everything Dataverse-side needs it: with its table.
 *
 * @throws When the strategy that resolved the project carried no entity name. Nothing can address a
 * record without its table, so this fails rather than quietly skipping the project on every write.
 */
export const toDataverseProject = (project: IProject): IDataverseProject => {
    const entityName = project.data?.entityName;
    if (typeof entityName !== 'string' || !entityName) {
        throw new Error(`The project "${project.id}" was resolved without an entity name. A project strategy used with the Dataverse task strategy has to carry it in the project's data — see DataverseProjectStrategy.`);
    }
    return { ...project, data: { ...project.data, entityName } };
};

/** Constructor parameters for {@link DataverseProjectStrategy}. */
export interface IDataverseProjectStrategyParams {
    /** The project record the descriptor hydrated, from its `projectRecord`. */
    projectRecord: ISingleRecord;
    /** Column on the project holding the date it starts. Omitted leaves the start marker undrawn. */
    startDateColumnName?: string;
    /** Column on the project holding the date it ends. */
    endDateColumnName?: string;
}

/**
 * Ready-to-use {@link IProjectStrategy} for Dataverse: the record the descriptor already hydrated from its
 * `projectRecord`, as an {@link IDataverseProject}.
 *
 * Its columns are carried over whole in `data`, which is what a FetchXML `{{ project.<column> }}` reads.
 * A record that cannot name its table fails the load rather than resolving a project nothing can write to.
 *
 * @example
 * ```ts
 * modules: {
 *     onGetProjectModule: ({ services, projectRecord }) => projectRecord && createProjectModule({
 *         strategy: new DataverseProjectStrategy({
 *             projectRecord,
 *             startDateColumnName: 'talxis_startdate',
 *             endDateColumnName: 'talxis_enddate',
 *         }),
 *         services,
 *     }),
 * }
 * ```
 */
export class DataverseProjectStrategy implements IProjectStrategy<IDataverseProjectData> {
    private _params: IDataverseProjectStrategyParams;

    constructor(params: IDataverseProjectStrategyParams) {
        this._params = params;
    }

    public async onGetProject(): Promise<IDataverseProject> {
        const record = this._params.projectRecord;
        const reference = record.getNamedReference();
        if (!reference.etn) {
            throw new Error(`The project record "${record.getRecordId()}" has no entity name. The descriptor's projectRecord has to name the table the project lives in.`);
        }
        return {
            id: record.getRecordId(),
            name: reference.name,
            startDate: this._getDate(this._params.startDateColumnName),
            endDate: this._getDate(this._params.endDateColumnName),
            data: { ...record.getRawData(), entityName: reference.etn },
        };
    }

    private _getDate(columnName?: string): Date | undefined {
        if (!columnName) {
            return undefined;
        }
        const value = this._params.projectRecord.getValue(columnName);
        if (!value || (typeof value !== 'string' && !(value instanceof Date))) {
            return undefined;
        }
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
    }
}
