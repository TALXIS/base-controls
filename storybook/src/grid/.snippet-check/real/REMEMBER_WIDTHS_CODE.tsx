import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => {
    const [savedWidths, setSavedWidths] = React.useState<{ [columnName: string]: number }>({})
    const [openCount, setOpenCount] = React.useState(0)
    const dealProvider = React.useMemo(() => {
        const dealProvider = createDocsProvider()
        dealProvider.setColumns(dealProvider.getColumns().map(column => ({
            ...column,
            visualSizeFactor: savedWidths[column.name] ?? column.visualSizeFactor,
        })))
        dealProvider.refresh()
        return dealProvider
    }, [openCount])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
            <DefaultButton text='Reopen the grid' onClick={() => setOpenCount(count => count + 1)} />
            <span>Resize a column, then reopen: {Object.keys(savedWidths).length} widths saved.</span>
        </Stack>
        <Grid.Root
            key={openCount}
            provider={dealProvider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            onColumnsChanged={columns => setSavedWidths(Object.fromEntries(columns.map(column => [column.name, column.visualSizeFactor ?? 0])))}
            height='400px' />
    </Stack>
}

export {}
