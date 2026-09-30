import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => {
    const [message, setMessage] = React.useState('Open a column menu.')
    const describeModule = React.useMemo<IGridModule>(() => ({
        onRegister: runtime => {
            runtime.services.get('columns').headers.registerColumnMenuItemsHook((items, header) => {
                items.push({
                    key: 'describe',
                    text: 'Describe this column',
                    iconProps: { iconName: 'Info' },
                    onClick: () => setMessage(header.getName() + ' holds ' + header.getColumn()?.dataType + ' values.'),
                })
            })
        },
    }), [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{message}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule(), custom: [describeModule] }}
            height='440px' />
    </Stack>
}

export {}
