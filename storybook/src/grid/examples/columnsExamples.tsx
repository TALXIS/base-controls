import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const PIN_AND_ALIGN_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={[
        { colId: 'name', pinned: 'left' },
        { colId: 'stage', pinned: 'right' },
        { colId: 'owner', settings: { alignment: 'center' } },
    ]}
    height='440px' />
`

export const COMPUTED_COLUMN_CODE = `const WeightedValueCell = (props: IGridCellParams) => {
    const value = Number(props.data.getValue('value') ?? 0)
    const probability = Number(props.data.getValue('probability') ?? 0)
    const weightedValue = Math.round(value * probability / 100)

    return <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.Container>
                <span style={{ padding: '0 9px', marginLeft: 'auto' }}>\${weightedValue.toLocaleString('en-US')}</span>
            </Grid.Cell.Container>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={[{
        colId: 'weighted',
        headerName: 'Weighted value',
        initialWidth: 140,
        sortable: false,
        valueGetter: () => null,
        cellRenderer: WeightedValueCell,
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
                initialWidth: 130,
                sortable: false,
                valueGetter: () => null,
                settings: {
                    cell: {
                        onGetCommands: (result, { record }) => {
                            result.items.push(
                                { key: 'open', title: 'Open', iconProps: { iconName: 'OpenInNewWindow' }, onClick: () => setLog('Opened ' + record.getFormattedValue('name')) },
                                { key: 'won', title: 'Mark as won', iconProps: { iconName: 'CheckMark' }, onClick: () => record.setValue('stage', 4) },
                            )
                            result.overflowItems.push(
                                { key: 'reset', text: 'Reset probability', iconProps: { iconName: 'Undo' }, onClick: () => record.setValue('probability', 0) },
                            )
                        },
                    },
                },
            }]}
            height='440px' />
    </Stack>
}
`

export const REMEMBER_WIDTHS_CODE = `const GridExample = () => {
    const [savedWidths, setSavedWidths] = React.useState<{ [columnName: string]: number }>({})
    const [openCount, setOpenCount] = React.useState(0)
    const dealProvider = React.useMemo(() => {
        const dealProvider = createDocsProvider()
        dealProvider.setColumns(dealProvider.getColumns().map(column => ({
            ...column,
            visualSizeFactor: savedWidths[column.name] ?? column.visualSizeFactor,
        })))
        dealProvider.refresh()
        return dealProvider
    }, [openCount])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
            <DefaultButton text='Reopen the grid' onClick={() => setOpenCount(count => count + 1)} />
            <span>Resize a column, then reopen: {Object.keys(savedWidths).length} widths saved.</span>
        </Stack>
        <Grid.Root
            key={openCount}
            provider={dealProvider}
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
