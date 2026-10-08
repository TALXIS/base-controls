import * as React from "react"
import { createAggregationModule, createEditingModule, createGroupingModule, createLicenseModule, createFilteringModule, createSortingModule, createLegacyClientApiCompatibilityModule, createRowSelectionModule, createClientSideRowModelModule, Grid as GridBase, IGridModules } from "@controls/grid"
import { IDatasetControlProps } from "@controls/dataset-control/interfaces";
import { useAgGridLicenseKey, useServices, useTaskDataProvider } from "@controls/task-grid/context";
import { GridCustomizer } from "./grid-customizer/GridCustomizer";
import { createTaskTreeModule } from "./taskTreeModule";

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
        return {
            license: licenseKey ? createLicenseModule({ key: licenseKey }) : undefined,
            rowModel: createClientSideRowModelModule(),
            //`'none'` is not a mode: a grid that should not offer selection is one with no selection module
            rowSelection: selectionMode === 'none' ? undefined : createRowSelectionModule({ mode: selectionMode }),
            editing: parameters.EnableEditing?.raw === true ? createEditingModule({ autoSave: parameters.EnableAutoSave?.raw === true }) : undefined,
            legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
            sorting: parameters.EnableSorting?.raw !== false ? createSortingModule() : undefined,
            filtering: parameters.EnableFiltering?.raw !== false ? createFilteringModule() : undefined,
            aggregation: parameters.EnableAggregation?.raw === true ? createAggregationModule() : undefined,
            //no grouping: this grid supplies a tree of its own, and the module would supply a second
            custom: [createTaskTreeModule(taskDataProvider, services)],
        };
    }, []);

    return <GridBase.Root
        provider={parameters.Grid.getDataProvider()}
        modules={modules}
        enableNavigation={parameters.EnableNavigation?.raw !== false}
        enableZebra={parameters.EnableZebra?.raw !== false}
        enableOptionSetColors={parameters.EnableOptionSetColors?.raw === true}
        rowHeight={parameters.RowHeight?.raw ?? undefined}
        maxVisibleRows={parameters.MaxVisibleRows?.raw ?? undefined}
        height={parameters.Height?.raw ?? undefined}
        //written in place, so the slice outlives a remount
        state={props.state ? (props.state.GridState ??= {}) : undefined}
    />
}
