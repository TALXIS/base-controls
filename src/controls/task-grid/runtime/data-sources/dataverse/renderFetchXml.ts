import { Liquid } from "liquidjs";
import type { ITaskRuntime } from "../..";
import type { IDataverseHostRecord } from "./DataverseTaskStore";

//the values land inside FetchXML attributes
const LIQUID = new Liquid({ outputEscape: 'escape' });

/** Renders a Liquid FetchXML over `project`, `hostRecord` and any `variables` given. */
export const renderFetchXml = (fetchXml: string, taskRuntime: ITaskRuntime, hostRecord?: IDataverseHostRecord, variables?: object): string => {
    const project = taskRuntime.services.get('datasetControl').modules.find('project');
    return LIQUID.parseAndRenderSync(fetchXml, {
        ...variables,
        project: project && { id: project.getId(), name: project.getName(), entityName: project.getEntityName(), ...project.getData() as object },
        hostRecord: hostRecord && { id: hostRecord.id, entityName: hostRecord.entityName, ...hostRecord.data },
    });
};
