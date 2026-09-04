import React from 'react'
import { createClientSideRowModelModule, createClipboardModule, createSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createServerSideRowModelModule, Grid, IGridModules } from '@talxis/base-controls'
import { MemoryDataProvider } from '@talxis/client-libraries'
import { COLUMNS, DATA_SOURCE, PRIMARY_ID } from './scratchGridData'

export interface IScratchGridProps {
    rowModel: 'clientSide' | 'serverSide'
    clipboard: boolean
    enableEditing: boolean
    enableAutoSave: boolean
    enableNavigation: boolean
    enableZebra: boolean
    enableOptionSetColors: boolean
    sorting: boolean
    filtering: boolean
    grouping: boolean
    aggregation: boolean
    selectableRows: 'none' | 'single' | 'multiple'
}

/**
 * The scratch harness for the shared `Grid`: an in-memory provider, and the grid rendered directly rather
 * than through a dataset control. Edit this file to try things against the grid.
 *
 * Every module is a toggle, which is the point: what a grid can do is what it was given, so turning one
 * off is how you see what the grid is without it. `owner` and `status` are the columns that say they can
 * be grouped, and `estimate` the one that says what it can total.
 */
export const ScratchGrid = (props: IScratchGridProps) => {
    const provider = React.useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: DATA_SOURCE,
            metadata: {
                PrimaryIdAttribute: PRIMARY_ID,
                PrimaryNameAttribute: 'name',
                LogicalName: 'mem_task',
                EntitySetName: 'mem_tasks',
            },
        })
        provider.setColumns(COLUMNS)
        return provider
    }, [])

    React.useEffect(() => {
        provider.refresh()
    }, [provider])

    //remounted on every change: modules are read once, which is the contract this story holds to
    const key = `${props.rowModel}-${props.clipboard}-${props.selectableRows}-${props.sorting}-${props.filtering}-${props.grouping}-${props.aggregation}`
    const modules = React.useMemo<IGridModules>(() => ({
        rowModel: props.rowModel === 'clientSide'
            ? createClientSideRowModelModule()
            : createServerSideRowModelModule(),
        clipboard: props.clipboard ? createClipboardModule() : undefined,
        //selection: props.selectableRows === 'none' ? undefined : createSelectionModule({ mode: props.selectableRows }),
        sorting: props.sorting ? createSortingModule() : undefined,
        filtering: props.filtering ? createFilteringModule() : undefined,
        aggregation: props.aggregation ? createAggregationModule() : undefined,
        //only offered on the server-side model, which is the only one it works on
        grouping: props.grouping && props.rowModel === 'serverSide' ? createGroupingModule() : undefined,
    }), [key])

    return <Grid
        key={key}
        provider={provider}
        modules={modules}
        height='420px'
        enableEditing={props.enableEditing}
        enableAutoSave={props.enableAutoSave}
        enableNavigation={props.enableNavigation}
        enableZebra={props.enableZebra}
        enableOptionSetColors={props.enableOptionSetColors}
        onGridReady={(api) => { (window as any).__scratchGridApi = api }}
    />
}
