import React from 'react'
import { Icon } from '@fluentui/react'
import { createCellSelectionModule, createClientSideRowModelModule, createClipboardModule, createSelectionModule, createFilteringModule, createSortingModule, createAggregationModule, createGroupingModule, createClientSideGroupingStrategy, createServerSideGroupingStrategy, createServerSideRowModelModule, Grid, IGridCellParams, IGridModule, IGridModules, IGridServiceLocator } from '@talxis/base-controls'
import { IRecord, MemoryDataProvider } from '@talxis/client-libraries'
import { COLUMNS, DEFAULT_ROW_COUNT, getDataSource, PRIMARY_ID } from './scratchGridData'

/** What a row's heat is read from, and what that value runs between. */
const HEAT_COLUMN = 'estimate'
const HEAT_RANGE = { min: 1, max: 8 }

/** Coolest to hottest. Pale on purpose: the values are drawn on this, and they still have to read. */
const HEAT_COLORS = ['#eef4ff', '#dbe8fc', '#eef2dd', '#fdf1cf', '#fbd9a5', '#f4a98d', '#ed8377']

/** What a record is worth on the heatmap, or nothing where it holds no value to read. */
const getHeatColor = (record: IRecord): string | undefined => {
    const value = record.getValue(HEAT_COLUMN)
    if (typeof value !== 'number') {
        return undefined
    }
    const position = Math.min(1, Math.max(0, (value - HEAT_RANGE.min) / (HEAT_RANGE.max - HEAT_RANGE.min)))
    return HEAT_COLORS[Math.round(position * (HEAT_COLORS.length - 1))]
}

const APPROVED_COLUMN = 'approved'

/** An approval as a mark rather than a word: ticked once it is approved, waiting until then. */
const ApprovedCell = (props: IGridCellParams) => <Grid.FieldCellRenderer {...props} components={{
    control: {
        onRenderControl: controlProps => {
            const record = controlProps.parameters.Record.raw
            const isApproved = !!record.getValue(APPROVED_COLUMN)
            return <Icon
                iconName={isApproved ? 'CompletedSolid' : 'Clock'}
                title={record.getFormattedValue(APPROVED_COLUMN) ?? ''}
                styles={{ root: { fontSize: 16, padding: '0 9px', color: isApproved ? '#107C10' : undefined } }} />
        },
    },
}} />

/** What the story adds through the services, wired onto whichever module it is given. */
const withCellHooks = (module: IGridModule): IGridModule => ({
    ...module,
    onRegister: (services: IGridServiceLocator) => {
        module.onRegister?.(services)
        //washed over every cell of the row, the checkboxes included: that is what a theme hook reaches and
        //a record's own formatting expression cannot
        services.get('cells').registerCellThemeHook((result, params) => {
            const background = getHeatColor(params.record)
            if (background) {
                result.colors.background = background
            }
        })
        services.get('columns').registerColumnDefinitionsHook(columnDefs => {
            const approved = columnDefs.find(columnDef => columnDef.colId === APPROVED_COLUMN)
            if (approved) {
                approved.cellRenderer = ApprovedCell
            }
        })
    },
})

export interface IScratchGridProps {
    rowModel: 'clientSide' | 'serverSide'
    clipboard: boolean
    cellSelection: boolean
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
    /** How many rows the in-memory provider holds. */
    rowCount?: number
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
    const rowCount = props.rowCount ?? DEFAULT_ROW_COUNT
    const provider = React.useMemo(() => {
        const provider = new MemoryDataProvider({
            dataSource: getDataSource(rowCount),
            metadata: {
                PrimaryIdAttribute: PRIMARY_ID,
                PrimaryNameAttribute: 'name',
                LogicalName: 'mem_task',
                EntitySetName: 'mem_tasks',
            },
        })
        provider.setColumns(COLUMNS)
        //the row models hand the grid whatever the provider holds, and what it holds is one page: a story
        //asking for ten thousand rows wants them all in play rather than the first fifty
        provider.getPaging().setPageSize(rowCount)
        return provider
    }, [rowCount])

    React.useEffect(() => {
        provider.refresh()
    }, [provider])

    //a value the record refuses, so a cell can be seen saying so: an estimate this team would not plan in
    React.useEffect(() => {
        provider.addEventListener('onRecordLoaded', (record: IRecord) => {
            record.expressions.setValidationExpression('estimate', () => {
                const estimate = Number(record.getValue('estimate') ?? 0)
                return { error: estimate > 5, errorMessage: `An estimate of ${estimate} days is more than the 5 this team plans a task in.` }
            })
        })
    }, [provider])

    //remounted on every change: modules are read once, which is the contract this story holds to
    const key = `${props.rowModel}-${props.clipboard}-${props.cellSelection}-${props.selectableRows}-${props.sorting}-${props.filtering}-${props.grouping}-${props.aggregation}`
    const modules = React.useMemo<IGridModules>(() => ({
        rowModel: withCellHooks(props.rowModel === 'clientSide'
            ? createClientSideRowModelModule()
            : createServerSideRowModelModule()),
        clipboard: props.clipboard ? createClipboardModule() : undefined,
        cellSelection: props.cellSelection ? createCellSelectionModule() : undefined,
        selection: props.selectableRows === 'none' ? undefined : createSelectionModule({ mode: props.selectableRows }),
        sorting: props.sorting ? createSortingModule() : undefined,
        filtering: props.filtering ? createFilteringModule() : undefined,
        aggregation: props.aggregation ? createAggregationModule() : undefined,
        //the strategy has to be the one for the row model above, which is what the module is refused for
        grouping: props.grouping
            ? createGroupingModule({
                strategy: props.rowModel === 'clientSide'
                    ? createClientSideGroupingStrategy()
                    : createServerSideGroupingStrategy(),
            })
            : undefined,
    }), [key])

    return <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Grid.Root
            key={key}
            provider={provider}
            modules={modules}
            height='100%'
            enableEditing={props.enableEditing}
            enableAutoSave={props.enableAutoSave}
            enableNavigation={props.enableNavigation}
            enableZebra={props.enableZebra}
            enableOptionSetColors={props.enableOptionSetColors}
            onGridReady={(api) => { (window as any).__scratchGridApi = api }} />
    </div>
}
