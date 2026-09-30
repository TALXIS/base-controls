import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsProvider } from '../gridDocsData'

export const CUSTOM_CELL_CODE = `const StageCell = (props: IGridCellParams) => <Grid.Cell.FieldRenderer {...props} components={{
    control: {
        onRenderControl: (controlProps, defaultRender) => {
            if (Number(controlProps.parameters.Record.raw.getValue('stage')) !== 4) {
                return defaultRender(controlProps)
            }
            return <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 9px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 12, background: '#107c10', color: '#ffffff', fontSize: 12, fontWeight: 600, lineHeight: '16px' }}>
                    <Icon iconName='CheckMark' style={{ fontSize: 10 }} /> Won
                </span>
            </div>
        },
    },
}} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{ stage: { cellRenderer: StageCell } }}
    height='440px' />
`

export const CUSTOM_HEADER_CODE = `const ValueHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={{
    label: {
        onRenderText: textProps => <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <Icon iconName='Money' style={{ color: '#107c10' }} />
            {textProps.children}
        </span>,
    },
}} />

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
    colDefs={{ value: { headerComponent: ValueHeader } }}
    height='440px' />
`

export const EMPTY_STATE_CODE = `const GridExample = () => {
    const emptyProvider = React.useMemo(() => {
        const emptyProvider = new MemoryDataProvider({
            dataSource: [],
            metadata: { PrimaryIdAttribute: 'docs_dealid', PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
        })
        emptyProvider.setColumns(provider.getColumns())
        emptyProvider.refresh()
        return emptyProvider
    }, [])

    return <Grid.Root
        provider={emptyProvider}
        modules={{ rowModel: createClientSideRowModelModule() }}
        labels={{ noRecordsFound: 'No deals in the pipeline yet.' }}
        components={{
            emptyRecordsOverlay: {
                onRenderIcon: iconProps => <Icon {...iconProps} iconName='Money' style={{ color: '#5B5FC7' }} />,
            },
        }}
        height='320px' />
}
`

export const LOADING_OVERLAY_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    components={{
        loadingOverlay: {
            onRenderSpinner: () => <Icon iconName='Sync' style={{ fontSize: 28, color: '#5B5FC7' }} />,
            onRenderText: textProps => <span style={{ fontWeight: 600, color: '#5B5FC7' }}>{textProps.children}</span>,
        },
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
        rowLoading: {
            onRenderShimmer: () => <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%', padding: '0 12px', color: '#605e5c' }}>
                <Icon iconName='Sync' /> Loading deals...
            </div>,
        },
    }}
    height='320px' />
`

export const MODULE_UI_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            components: {
                sortIcon: {
                    onRenderIcon: ({ descending, ...iconProps }) => <Icon {...iconProps} iconName={descending ? 'ChevronDownMed' : 'ChevronUpMed'} style={{ color: '#5B5FC7' }} />,
                },
            },
        }),
        filtering: createFilteringModule({
            components: {
                filterIcon: {
                    onRenderIcon: iconProps => <Icon {...iconProps} style={{ color: '#5B5FC7' }} />,
                },
            },
        }),
    }}
    height='440px' />
`

const createLoadingProvider = () => {
    const provider = createDocsProvider()
    provider.isLoading = () => true
    provider.getLoadingMessage = () => 'Fetching your pipeline...'
    return provider
}

export const CustomCellExample = () => <GridExampleRunner seedCode={CUSTOM_CELL_CODE} />
export const CustomHeaderExample = () => <GridExampleRunner seedCode={CUSTOM_HEADER_CODE} />
export const EmptyStateExample = () => <GridExampleRunner seedCode={EMPTY_STATE_CODE} />
export const LoadingOverlayExample = () => <GridExampleRunner seedCode={LOADING_OVERLAY_CODE} onCreateProvider={createLoadingProvider} />
export const LoadingRowsExample = () => <GridExampleRunner seedCode={LOADING_ROWS_CODE} />
export const ModuleUiExample = () => <GridExampleRunner seedCode={MODULE_UI_CODE} />
