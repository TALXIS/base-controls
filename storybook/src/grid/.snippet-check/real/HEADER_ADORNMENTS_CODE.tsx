import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const currencyModule: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').headers.registerColumnHeaderAdornmentsHook((adornments, header) => {
            if (header.getColumn()?.name !== 'value') {
                return
            }
            adornments.push({
                key: 'currency',
                placement: 'suffix',
                title: 'in USD',
                onRender: () => <Icon iconName='Money' style={{ color: '#107c10' }} />,
            })
        })
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), custom: [currencyModule] }}
    height='440px' />

export {}
