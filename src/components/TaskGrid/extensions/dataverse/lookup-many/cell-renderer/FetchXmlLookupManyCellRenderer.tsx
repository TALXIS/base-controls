import { IRecord } from "@talxis/client-libraries";
import { useTaskDataProvider } from "@components/TaskGrid/context";
import { FetchXmlDataProviderFactory } from "./FetchXmlDataProviderFactory";
import React from "react";
import { LookupManyCellRenderer } from '@components/TaskGrid/components/grid/cell-renderers/lookup-many'
import { ICellProps } from "@components/Grid/cells/cell/Cell";
import { IDataverseTaskStrategy } from "@components/TaskGrid/extensions/dataverse/DataverseTaskStrategy";

export const FetchXmlLookupManyCellRenderer = (props: ICellProps) => {
    const { baseColumn } = props;
    const record: IRecord = props.data;
    const strategy: IDataverseTaskStrategy = useTaskDataProvider().getStrategy();
    const projectRecord = strategy.getProjectRecord();
    const customControl = record.getColumnInfo(baseColumn.name).ui.getCustomControls([])?.[0];
    const fetchXml = customControl?.bindings?.FetchXml.value;
    const taskId = record.getRecordId();
    const dataProvider = React.useMemo(() => FetchXmlDataProviderFactory.create({
        fetchXml: fetchXml,
        variables: {
            task: {
                id: taskId,
                ...record.getRawData()
            },
            project: {
                id: projectRecord?.getRecordId(),
                ...projectRecord?.getRawData()
            }
        }
    }), []);

    if (!fetchXml) {
        throw new Error('FetchXml for LookupMany is not defined in column metadata. Define it using the "FetchXml" property.');
    }

    return <LookupManyCellRenderer 
        {...props} 
        dataProvider={dataProvider} />

}