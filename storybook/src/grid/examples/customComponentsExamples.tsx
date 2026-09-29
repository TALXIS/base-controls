import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsProvider } from '../gridDocsData'

export const CUSTOM_CELL_CODE = `const StatusCell = (props: IGridCellParams) => <Grid.Cell.FieldRenderer {...props} components={{
    control: {
        onRenderControl: (controlProps, defaultRender) => {
            if (Number(controlProps.parameters.Record.raw.getValue('status')) !== 4) {
                return defaultRender(controlProps)
            }
            return <span style={{ margin: '0 9px', padding: '2px 10px', borderRadius: 10, background: '#dff6dd', color: '#107c10', fontWeight: 600 }}>
                ✓ Done
            </span>
        },
    },
}} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={[{ colId: 'status', cellRenderer: StatusCell }]}
    height='440px' />
`

export const CUSTOM_HEADER_CODE = `const BudgetHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={{
    label: {
        onRenderLabel: labelProps => <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon iconName='Money' style={{ color: '#107c10' }} />
            <Grid.ColumnHeader.Ui.Label {...labelProps} />
        </span>,
    },
}} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
    colDefs={[{ colId: 'budget', headerComponent: BudgetHeader }]}
    height='440px' />
`

export const EMPTY_STATE_CODE = `const GridExample = () => {
    const emptyProvider = React.useMemo(() => {
        const emptyProvider = new MemoryDataProvider({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'docs_taskid', PrimaryNameAttribute: 'name', LogicalName: 'docs_task', EntitySetName: 'docs_tasks' },
        })
        emptyProvider.setColumns(provider.getColumns())
        emptyProvider.refresh()
        return emptyProvider
    }, [])

    return <Grid.Root
        provider={emptyProvider}
        modules={{ rowModel: createClientSideRowModelModule() }}
        components={{
            onRenderEmptyRecordsOverlay: props => <Grid.Overlay.Ui.EmptyRecords
                {...props}
                message='No tasks yet. Create one to get started.'
                components={{
                    onRenderIcon: iconProps => <Icon {...iconProps} iconName='TaskManager' style={{ color: '#5B5FC7' }} />,
                }} />,
        }}
        height='320px' />
}
`

export const LOADING_OVERLAY_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    components={{
        onRenderLoadingOverlay: props => <Grid.Overlay.Ui.Loading {...props} components={{
            onRenderSpinner: () => <Icon iconName='Sync' style={{ fontSize: 28, color: '#5B5FC7' }} />,
            onRenderText: textProps => <span style={{ fontWeight: 600, color: '#5B5FC7' }}>{textProps.children}</span>,
        }} />,
    }}
    height='320px' />
`

export const LOADING_ROWS_CODE = `//a datasource that never answers keeps the rows loading
const neverLoadModule: IGridModule = {
    onRegister: runtime => {
        runtime.registerAgGridOptions(result => {
            result.options.serverSideDatasource = { getRows: () => { } }
        }, 1000)
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createServerSideRowModelModule(), custom: [neverLoadModule] }}
    components={{
        onRenderRowLoading: props => <Grid.Row.Ui.Loading {...props} components={{
            onRenderShimmer: () => <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 12px', color: '#605e5c' }}>
                <Icon iconName='Sync' /> Loading tasks...
            </div>,
        }} />,
    }}
    height='320px' />
`

export const MODULE_UI_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            components: {
                onRenderSortIcon: props => <Icon iconName={props.descending ? 'ChevronDownMed' : 'ChevronUpMed'} style={{ color: '#5B5FC7' }} />,
            },
        }),
        filtering: createFilteringModule({
            components: {
                onRenderFilterIcon: iconProps => <Icon {...iconProps} style={{ color: '#5B5FC7' }} />,
            },
        }),
    }}
    height='440px' />
`

const createLoadingProvider = () => {
    const provider = createDocsProvider()
    provider.isLoading = () => true
    provider.getLoadingMessage = () => 'Fetching your tasks...'
    return provider
}

export const CustomCellExample = () => <GridExampleRunner seedCode={CUSTOM_CELL_CODE} />
export const CustomHeaderExample = () => <GridExampleRunner seedCode={CUSTOM_HEADER_CODE} />
export const EmptyStateExample = () => <GridExampleRunner seedCode={EMPTY_STATE_CODE} />
export const LoadingOverlayExample = () => <GridExampleRunner seedCode={LOADING_OVERLAY_CODE} onCreateProvider={createLoadingProvider} />
export const LoadingRowsExample = () => <GridExampleRunner seedCode={LOADING_ROWS_CODE} />
export const ModuleUiExample = () => <GridExampleRunner seedCode={MODULE_UI_CODE} />
