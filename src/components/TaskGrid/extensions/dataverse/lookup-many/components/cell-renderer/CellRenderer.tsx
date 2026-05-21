import { IRecord } from "@talxis/client-libraries";
import { ICellProps } from "../../../../../../Grid/cells/cell/Cell";
import { useTaskDataProvider } from "../../../../..";
import { ColorfulLookupMany, LookupMany, PeopleLookupMany } from "../../../../../components/grid/lookup-many";
import { FetchXmlDataProviderFactory } from "./FetchXmlDataProviderFactory";
import React from "react";
import { IDataverseTaskStrategy } from "../../../DataverseTaskStrategy";

interface ICellRendererProps extends ICellProps {
    fetchXml: string;
    onRecordSelect?: (selectedRecords: ComponentFramework.EntityReference[]) => void;
    onRecordOpen?: (entityReference: ComponentFramework.EntityReference) => void;
}

enum ControlName {
    LookupMany = 'LookupMany',
    PeopleLookupMany = 'PeopleLookupMany',
    ColorfulLookupMany = 'ColorfulLookupMany',
}

export const CellRenderer = (props: ICellRendererProps) => {
    const { api, baseColumn } = props;
    const record: IRecord = props.data;
    const isDisabled = !props.value.editable;
    const customControl = record.getColumnInfo(baseColumn.name).ui.getCustomControls([])?.[0];
    const controlName = customControl.name ?? ControlName.LookupMany as ControlName;
    const bindings = customControl?.bindings;
    const taskId = record.getRecordId();
    const provider = useTaskDataProvider();
    const strategy: IDataverseTaskStrategy = useTaskDataProvider().getStrategy();
    const projectReference = strategy.getProjectReference();
    const fetchXml = customControl?.bindings?.FetchXml.value;
    
    if(!fetchXml) {
        throw new Error('FetchXml for LookupMany is not defined in column metadata. Define it using the "LookupManyFetchXml" property.');
    }
    const value: ComponentFramework.EntityReference[] | undefined = record.getValue(props.colDef!.colId!) as ComponentFramework.EntityReference[] | undefined;
    const dataProvider = React.useMemo(() => FetchXmlDataProviderFactory.create({
        fetchXml: fetchXml,
        variables: {
            taskId: taskId,
            projectId: projectReference?.id.guid
        }
    }), []);

    const onSelectionChange = (selectedRecords: ComponentFramework.EntityReference[]) => {
        record.setValue(props.colDef!.colId!, selectedRecords);
        record.save();
        api.refreshCells({
            rowNodes: [props.node],
            columns: [props.colDef!.colId!],
            force: true
        })
    }

    const onRecordOpen = (entityReference: ComponentFramework.EntityReference) => {
        provider.openDatasetItem(entityReference, {
            columnName: baseColumn.name
        });
    }

    switch (controlName) {
        case ControlName.ColorfulLookupMany:
            return <ColorfulLookupMany
                dataProvider={dataProvider}
                selectedRecords={value}
                isDisabled={isDisabled}
                colorPropertyName={bindings?.ColorPropertyName?.value}
                onRecordSelect={onSelectionChange}
                onRecordOpen={onRecordOpen}
            />
        case ControlName.PeopleLookupMany:
            return <PeopleLookupMany
                dataProvider={dataProvider}
                selectedRecords={value}
                isDisabled={isDisabled}
                imageUrlPropertyName={bindings?.ImageUrlPropertyName?.value}
                onRecordSelect={onSelectionChange}
                onRecordOpen={onRecordOpen}
            />
        default: {
            return <LookupMany
                dataProvider={dataProvider}
                selectedRecords={value}
                isDisabled={isDisabled}
                onRecordSelect={onSelectionChange}
                onRecordOpen={onRecordOpen}
            />
        }
    }
}