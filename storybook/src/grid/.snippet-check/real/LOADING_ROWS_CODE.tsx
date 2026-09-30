import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
//a datasource that never answers keeps the rows loading
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

export {}
