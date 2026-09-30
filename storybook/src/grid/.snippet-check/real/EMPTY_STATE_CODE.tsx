import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => {
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

export {}
