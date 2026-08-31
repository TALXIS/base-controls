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
                    services.register('gridApi', () => event.api);
                    props.onGridReady?.(event);
                }
            }
        }}
    />
}