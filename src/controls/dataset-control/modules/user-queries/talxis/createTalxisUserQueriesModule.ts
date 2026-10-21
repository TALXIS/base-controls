import type { IUserQueriesModule } from "../interfaces";
import { createDataverseUserQueriesModule, IDataverseUserQueriesModuleParameters, IDataverseUserQueriesTable } from "../dataverse";

const TALXIS_TABLE: IDataverseUserQueriesTable = {
    name: 'talxis_userquery',
    fieldMapping: {
        name: 'talxis_name',
        description: 'talxis_description',
        layout: 'talxis_layoutjson',
        returnedTypeCode: 'talxis_returnedtypecode',
        recordId: 'talxis_recordid',
    },
};

export interface ITalxisUserQueriesModuleParameters<TData> extends Omit<IDataverseUserQueriesModuleParameters<TData>, 'table'> { }

/** The user's views as TALXIS `talxis_userquery` records. */
export const createTalxisUserQueriesModule = <TData,>(parameters: ITalxisUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createDataverseUserQueriesModule<TData>({ ...parameters, table: TALXIS_TABLE });
