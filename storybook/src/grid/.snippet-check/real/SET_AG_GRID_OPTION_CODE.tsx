import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
const GridExample = () => {
    const [isTall, setIsTall] = React.useState(false)
    const isTallRef = React.useRef(isTall)
    const runtimeRef = React.useRef<IGridRuntime>()
    const headerHeightModule = React.useMemo<IGridModule>(() => ({
        onRegister: runtime => {
            runtimeRef.current = runtime
            runtime.registerAgGridOptions(result => {
                result.options.headerHeight = isTallRef.current ? 56 : undefined
            })
        },
    }), [])

    React.useEffect(() => {
        isTallRef.current = isTall
        runtimeRef.current?.refreshAgGridOptions()
    }, [isTall])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Tall headers' inlineLabel checked={isTall} onChange={(_event, checked) => setIsTall(!!checked)} />
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), custom: [headerHeightModule] }}
            height='440px' />
    </Stack>
}

export {}
