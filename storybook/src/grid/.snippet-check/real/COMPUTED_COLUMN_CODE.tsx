import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const WeightedValueCell = (props: IGridCellParams) => {
    const value = Number(props.data.getValue('value') ?? 0)
    const probability = Number(props.data.getValue('probability') ?? 0)
    const weightedValue = Math.round(value * probability / 100)

    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <span style={{ padding: '0 9px', marginLeft: 'auto' }}>${weightedValue.toLocaleString('en-US')}</span>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{
        weighted: {
            headerName: 'Weighted value',
            initialWidth: 140,
            sortable: false,
            valueGetter: () => null,
            cellRenderer: WeightedValueCell,
        },
    }}
    height='440px' />

export {}
