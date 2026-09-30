import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => <Stack tokens={{ childrenGap: 8 }}>
    <span>Drag across cells to highlight them, then press Ctrl+C and paste into a spreadsheet.</span>
    <Grid.Root
        provider={provider}
        modules={{
            rowModel: createClientSideRowModelModule(),
            cellSelection: createCellSelectionModule({ enableFillHandle: false }),
            clipboard: createClipboardModule({ copyHeadersToClipboard: true }),
        }}
        height='440px' />
</Stack>

export {}
