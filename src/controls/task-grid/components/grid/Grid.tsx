import * as React from "react"
import { AgGridReact, createAggregationModule, createGroupingModule, createLicenseModule, createFilteringModule, createSortingModule, createRowSelectionModule, createClientSideRowModelModule, Grid as GridBase, IGridModules } from "@controls/grid"
import { IRecord } from "@talxis/client-libraries";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { IDatasetControlProps } from "@controls/dataset-control/interfaces";
import { useAgGridLicenseKey, useServices, useTaskDataProvider } from "@controls/task-grid/context";
import { GridCustomizer } from "./grid-customizer/GridCustomizer";

type IControlProps = Parameters<IDatasetControlProps['onGetControlComponent']>[0];

/** The AG Grid instance itself, configured by {@link GridCustomizer}. */
export const Grid = (props: IControlProps) => {
    const licenseKey = useAgGridLicenseKey();
    const taskDataProvider = useTaskDataProvider();
    const services = useServices();
    const parameters = props.parameters;
    //every task is already in memory, so the grid holds the whole hierarchy rather than asking for a level
    //at a time. A level fetched on demand renders as a placeholder row until it arrives, and the chart -
    //which has every task - then shows a different task on that line
    const selectionMode = parameters.SelectableRows?.raw ?? 'multiple';
    const modules = React.useMemo<IGridModules>(() => {
        const rowModel = createClientSideRowModelModule();
        return {
            license: licenseKey ? createLicenseModule({ key: licenseKey }) : undefined,
            //`treeData` below is AG Grid's row grouping
            rowModel: { ...rowModel, agGridModules: [...(rowModel.agGridModules ?? []), RowGroupingModule] },
            //`'none'` is not a mode: a grid that should not offer selection is one with no selection module
            rowSelection: selectionMode === 'none' ? undefined : createRowSelectionModule({ mode: selectionMode }),
            sorting: parameters.EnableSorting?.raw !== false ? createSortingModule() : undefined,
            filtering: parameters.EnableFiltering?.raw !== false ? createFilteringModule() : undefined,
            aggregation: parameters.EnableAggregation?.raw === true ? createAggregationModule() : undefined,
            //no grouping: this grid supplies a tree of its own below, and the module would supply a second
        };
    }, []);

    return <GridBase.Root
        provider={parameters.Grid.getDataProvider()}
        modules={modules}
        enableEditing={parameters.EnableEditing?.raw === true}
        enableNavigation={parameters.EnableNavigation?.raw !== false}
        enableAutoSave={parameters.EnableAutoSave?.raw === true}
        enableZebra={parameters.EnableZebra?.raw !== false}
        enableOptionSetColors={parameters.EnableOptionSetColors?.raw === true}
        rowHeight={parameters.RowHeight?.raw ?? undefined}
        maxVisibleRows={parameters.MaxVisibleRows?.raw ?? undefined}
        height={parameters.Height?.raw ?? undefined}
        inlineRibbonButtonIds={parameters.InlineRibbonButtonIds?.raw ?? undefined}
        state={props.state?.AgGridState}
        components={{
            onRenderAgGrid: (agGridProps) => <AgGridReact
                {...agGridProps}
                treeData
                groupDisplayType='custom'
                getDataPath={(record: IRecord) => taskDataProvider.getRecordTree().structure.getAncestorIds(record.getRecordId())}
                suppressGroupRowsSticky
                processUnpinnedColumns={() => []}
                onGridReady={(event) => {
                    //ahead of the grid's own, so the first columns meet the customizer's patch
                    services.register('gridApi', () => event.api);
                    agGridProps.onGridReady?.(event);
                }}
            />
        }}
    />
}
