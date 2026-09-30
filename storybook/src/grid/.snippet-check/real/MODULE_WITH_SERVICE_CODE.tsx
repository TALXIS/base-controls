import type { IDataProvider, IRecord, IColumn, IFieldValidationResult } from '@talxis/client-libraries'
import type { IGridCellParams, IGridModule, IGridRuntime, IColumnHeaderRendererProps, IGridCellCommands, IRecordLockIndicatorCellComponents, IGridColDef } from '@talxis/base-controls'
import { GRID_SANDBOX_SCOPE } from '../../gridSandboxScope'
const { React, Grid, useGridService, GRID_MODULE_PRIORITY, RECORD_LOCK_COLUMN_KEY, createClientSideRowModelModule, createServerSideRowModelModule, createRowSelectionModule, createCellSelectionModule, createClipboardModule, createSortingModule, createFilteringModule, createGroupingModule, createAggregationModule, createDocsProvider, MemoryDataProvider, DataTypes, Operators, Icon, IconButton, PrimaryButton, DefaultButton, MessageBar, MessageBarType, Stack, Toggle, TooltipHost, mergeStyleSets, FontWeights } = GRID_SANDBOX_SCOPE
declare const provider: IDataProvider
interface IClickCounter {
    getCount(): number
    subscribe(listener: () => void): () => void
}

declare module '@talxis/base-controls' { interface IGridOptionalServiceMap {
    clickCounter: IClickCounter
} }

const ClickCounterBar = () => {
    const counter = useGridService('clickCounter')
    const [count, setCount] = React.useState(counter?.getCount() ?? 0)

    React.useEffect(() => counter?.subscribe(() => setCount(counter.getCount())), [counter])

    return <div style={{ padding: '6px 12px', borderTop: '1px solid #edebe9', color: '#605e5c' }}>
        Rows clicked: <b>{count}</b>
    </div>
}

const createClickCounterModule = (): IGridModule => ({
    onRegister: runtime => {
        let count = 0
        const listeners = new Set<() => void>()
        const counter: IClickCounter = {
            getCount: () => count,
            subscribe: listener => {
                listeners.add(listener)
                return () => listeners.delete(listener)
            },
        }
        const onRowClicked = () => {
            count++
            listeners.forEach(listener => listener())
        }
        runtime.services.register('clickCounter', () => counter)
        runtime.services.get('rows').addEventListener('onRowClicked', onRowClicked)
        runtime.events.addEventListener('onDestroyed', () => runtime.services.get('rows').removeEventListener('onRowClicked', onRowClicked))
        runtime.services.get('surfaces').registerSurfaceHook(surfaces => {
            surfaces.push({ key: 'clickCounter', onRender: () => <ClickCounterBar /> })
        })
    },
})

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        custom: [createClickCounterModule()],
    }}
    height='400px' />

export {}
