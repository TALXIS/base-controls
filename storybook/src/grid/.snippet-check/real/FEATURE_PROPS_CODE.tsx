import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => {
    const [isZebra, setIsZebra] = React.useState(true)
    const [hasOptionColors, setHasOptionColors] = React.useState(true)
    const [isCompact, setIsCompact] = React.useState(false)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 24 }}>
            <Toggle label='Zebra rows' inlineLabel checked={isZebra} onChange={(_event, checked) => setIsZebra(!!checked)} />
            <Toggle label='Option set colours' inlineLabel checked={hasOptionColors} onChange={(_event, checked) => setHasOptionColors(!!checked)} />
            <Toggle label='Compact rows' inlineLabel checked={isCompact} onChange={(_event, checked) => setIsCompact(!!checked)} />
        </Stack>
        <Grid.Root
            key={[isZebra, hasOptionColors, isCompact].join()}
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableZebra={isZebra}
            enableOptionSetColors={hasOptionColors}
            rowHeight={isCompact ? 32 : 42}
            height='440px' />
    </Stack>
}

export {}
