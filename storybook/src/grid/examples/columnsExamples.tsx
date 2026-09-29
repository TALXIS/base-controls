import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const PIN_AND_ALIGN_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={[
        { colId: 'name', pinned: 'left' },
        { colId: 'status', pinned: 'right' },
        { colId: 'owner', settings: { alignment: 'center' } },
    ]}
    height='440px' />
`

export const COMPUTED_COLUMN_CODE = `const RemainingCell = (props: IGridCellParams) => {
    const estimate = Number(props.data.getValue('estimate') ?? 0)
    const progress = Number(props.data.getValue('progress') ?? 0)
    const remaining = estimate * (100 - progress) / 100

    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <span style={{ padding: '0 9px' }}>{remaining.toFixed(1)} days</span>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={[{
        colId: 'remaining',
        headerName: 'Remaining',
        initialWidth: 130,
        sortable: false,
        valueGetter: () => null,
        cellRenderer: RemainingCell,
    }]}
    height='440px' />
`

export const ACTIONS_COLUMN_CODE = `const GridExample = () => {
    const [log, setLog] = React.useState('Hover a row to see what it offers.')

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{log}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            colDefs={[{
                colId: 'actions',
                headerName: '',
                pinned: 'right',
                initialWidth: 96,
                sortable: false,
                valueGetter: () => null,
                settings: {
                    onGetCommands: record => ({
                        items: [
                            { key: 'open', title: 'Open', iconProps: { iconName: 'OpenInNewWindow' }, onClick: () => setLog('Opened ' + record.getFormattedValue('name')) },
                            { key: 'done', title: 'Mark as done', iconProps: { iconName: 'CheckMark' }, onClick: () => record.setValue('status', 4) },
                        ],
                        overflowItems: [
                            { key: 'reset', text: 'Reset progress', iconProps: { iconName: 'Undo' }, onClick: () => record.setValue('progress', 0) },
                        ],
                    }),
                },
            }]}
            height='440px' />
    </Stack>
}
`

export const REMEMBER_WIDTHS_CODE = `const GridExample = () => {
    const [savedWidths, setSavedWidths] = React.useState<{ [columnName: string]: number }>({})
    const [openCount, setOpenCount] = React.useState(0)
    const taskProvider = React.useMemo(() => {
        const taskProvider = createDocsProvider()
        taskProvider.setColumns(taskProvider.getColumns().map(column => ({
            ...column,
            visualSizeFactor: savedWidths[column.name] ?? column.visualSizeFactor,
        })))
        taskProvider.refresh()
        return taskProvider
    }, [openCount])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
            <DefaultButton text='Reopen the grid' onClick={() => setOpenCount(count => count + 1)} />
            <span>Resize a column, then reopen: {Object.keys(savedWidths).length} widths saved.</span>
        </Stack>
        <Grid.Root
            key={openCount}
            provider={taskProvider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            onColumnsChanged={columns => setSavedWidths(Object.fromEntries(columns.map(column => [column.name, column.visualSizeFactor ?? 0])))}
            height='400px' />
    </Stack>
}
`

export const PinAndAlignExample = () => <GridExampleRunner seedCode={PIN_AND_ALIGN_CODE} />
export const ComputedColumnExample = () => <GridExampleRunner seedCode={COMPUTED_COLUMN_CODE} />
export const ActionsColumnExample = () => <GridExampleRunner seedCode={ACTIONS_COLUMN_CODE} />
export const RememberWidthsExample = () => <GridExampleRunner seedCode={REMEMBER_WIDTHS_CODE} />
