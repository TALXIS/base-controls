import { FetchXmlDataProvider, ISingleRecord } from "@talxis/client-libraries";
import { Liquid } from "liquidjs";
import { createLookupManyModule, ILookupManyModule } from "../createLookupManyModule";
import type { ILookupManyColumn, ILookupManyOptionsParameters, ILookupManyParameters } from "../LookupMany";
import { DataverseLookupManyHandler } from "./DataverseLookupManyHandler";

/** One Dataverse lookup-many column: the relationship it is reached through, and what it offers. */
export interface IDataverseLookupManyColumn extends ILookupManyColumn {
    /** Either side's navigation property of the 1:N or N:N relationship. */
    navigationPropertyName: string;
    /** The related records' columns to read, comma separated. */
    select?: string;
    /** Set when the relationship goes through an intersection entity of your own. */
    customIntersection?: {
        /** The intersection entity's navigation property to the related record. */
        navigationPropertyName: string;
    };
    /** Liquid FetchXML over `task`, `project` and `currentRecord` for the records offered; read-only without it. */
    fetchXml?: string;
}

export interface IDataverseLookupManyModuleParameters extends Omit<ILookupManyParameters<IDataverseLookupManyColumn>, 'onCreateOptionsProvider'> {
    /** The record the grid sits on, as `currentRecord` in a column's FetchXML. */
    sourceRecord?: ISingleRecord;
}

//the values land inside FetchXML attributes
const LIQUID = new Liquid({ outputEscape: 'escape' });

//a column offers what its FetchXML selects, rendered for the task
const createOptionsProvider = (parameters: ILookupManyOptionsParameters<IDataverseLookupManyColumn>, sourceRecord?: ISingleRecord) => {
    const { record, settings, taskRuntime } = parameters;
    const fetchXml = settings.fetchXml;
    if (!fetchXml) {
        return undefined;
    }
    const project = taskRuntime.services.get('datasetControl').modules.find('project');
    return new FetchXmlDataProvider({
        fetchXml: LIQUID.parseAndRenderSync(fetchXml, {
            task: { id: record.getRecordId(), ...record.getRawData() },
            project: { id: project?.id, ...project?.data as object },
            currentRecord: { id: sourceRecord?.getRecordId(), ...sourceRecord?.getRawData() },
        }),
    });
};

/** Lookup-many columns of Dataverse tasks, loaded and saved through their relationships. */
export const createDataverseLookupManyModule = (parameters: IDataverseLookupManyModuleParameters): ILookupManyModule => {
    const { sourceRecord, ...moduleParameters } = parameters;
    const module = createLookupManyModule({ ...moduleParameters, onCreateOptionsProvider: options => createOptionsProvider(options, sourceRecord) });
    return {
        ...module,
        onLoad: async datasetControl => {
            const lookupMany = await module.onLoad(datasetControl);
            const taskRuntime = datasetControl.parts.get('taskRuntime');
            const pcfContext = taskRuntime.services.get('pcfContext');
            taskRuntime.services.whenAvailable('provider', provider => provider.registerColumnHandler(new DataverseLookupManyHandler({ provider, pcfContext, columns: parameters.columns })));
            return lookupMany;
        },
    };
};
