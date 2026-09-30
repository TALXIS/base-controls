import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const validateProbability = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    const probability = Number(record.getValue('probability') ?? 0)
    if (probability < 0 || probability > 100) {
        result.error = true
        result.errorMessage = 'A probability is between 0 and 100 %.'
    }
}

const GridExample = () => {
    const [status, setStatus] = React.useState('Change a value, then leave the cell.')

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{status}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableEditing
            enableAutoSave
            colDefs={{ probability: { settings: { cell: { onGetValidation: validateProbability } } } }}
            onBeforeRecordSaved={record => setStatus('Saving ' + record.getFormattedValue('name') + '...')}
            onAfterRecordSaved={result => setStatus(result.success ? 'Saved.' : 'The save failed.')}
            height='440px' />
    </Stack>
}

export {}
