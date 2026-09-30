import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => {
    const [isServerSide, setIsServerSide] = React.useState(false)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server-side rows' inlineLabel checked={isServerSide} onChange={(_event, checked) => setIsServerSide(!!checked)} />
        <Grid.Root
            key={isServerSide ? 'server' : 'client'}
            provider={provider}
            modules={{
                rowModel: isServerSide ? createServerSideRowModelModule() : createClientSideRowModelModule(),
                grouping: createGroupingModule(),
            }}
            height='440px' />
    </Stack>
}

export {}
