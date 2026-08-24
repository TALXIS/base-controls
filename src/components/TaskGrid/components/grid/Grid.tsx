import { IGrid, Grid as GridBase } from "@components/Grid"
import * as React from "react"
import { useAgGridLicenseKey, useDatasetControl, useServices, useTaskDataProvider, useTaskGridComponents } from "@components/TaskGrid/context";
import { GridReadyEvent } from "@ag-grid-community/core";
import { GridCustomizer } from "./grid-customizer/GridCustomizer";
import { IRecord } from "@talxis/client-libraries";


/** The AG Grid instance itself, configured by {@link GridCustomizer}. */
export const Grid = (props: IGrid) => {
    const licenseKey = useAgGridLicenseKey();
    const taskDataProvider = useTaskDataProvider();
    const gridCustomizerRef = React.useRef<GridCustomizer>();
    const datasetControl = useDatasetControl();
    const services = useServices();
    const components = useTaskGridComponents();
    const componentsRef = React.useRef(components);
    componentsRef.current = components;

    const onGridReady = (event: GridReadyEvent) => {
        gridCustomizerRef.current = new GridCustomizer({
            datasetControl,
            gridApi: event.api,
            strategy: services.find('gridCustomizerModule')?.strategy,
            onGetComponents: () => componentsRef.current
        })
    }

    return <GridBase {...props}
        parameters={{
            ...props.parameters,
            LicenseKey: {
                raw: licenseKey
            },
        }}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                treeData: true,
                suppressGroupRowsSticky: true,
                processUnpinnedColumns: () => [],
                isServerSideGroup: (record: IRecord) => taskDataProvider.getRecordTree().view.hasChildren(record.getRecordId()),
                getServerSideGroupKey: (record: IRecord) => record.getRecordId(),
                onGridReady: (event) => {
                    onGridReady(event);
                    props.onGridReady?.(event);
                }
            }
        }}
    />
}