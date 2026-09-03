import { IGrid, Grid as GridBase } from "@components/Grid"
import * as React from "react"
import { useAgGridLicenseKey, useServices, useTaskDataProvider } from "@components/TaskGrid/context";
import { GridCustomizer } from "./grid-customizer/GridCustomizer";
import { IRecord } from "@talxis/client-libraries";


/** The AG Grid instance itself, configured by {@link GridCustomizer}. */
export const Grid = (props: IGrid) => {
    const licenseKey = useAgGridLicenseKey();
    const taskDataProvider = useTaskDataProvider();
    const services = useServices();

    return <GridBase {...props}
        onGetRowData={() => taskDataProvider.getVisibleRecords()}
        parameters={{
            ...props.parameters,
            LicenseKey: {
                raw: licenseKey
            },
        }}
        onOverrideComponentProps={(props) => {
            return {
                ...props,
                //every task is already in memory, so the grid holds the whole hierarchy rather than
                //asking for a level at a time. A level fetched on demand renders as a placeholder row
                //until it arrives, and the chart - which has every task - then shows a different task on
                //the same line
                rowModelType: 'clientSide' as const,
                treeData: true,
                getDataPath: (record: IRecord) => taskDataProvider.getRecordTree().structure.getAncestorIds(record.getRecordId()),
                suppressGroupRowsSticky: true,
                processUnpinnedColumns: () => [],
                onGridReady: (event) => {
                    services.register('gridApi', () => event.api);
                    props.onGridReady?.(event);
                }
            }
        }}
    />
}