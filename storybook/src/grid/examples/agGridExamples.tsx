import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTicketsProvider } from '../data'

export const REARRANGE_COLUMNS_CODE = `const createColumnOrderLock = (isUnlocked: () => boolean): IGridModule => ({
    onRegister: runtime => {
        runtime.registerAgGridOptions(result => {
            result.options.suppressMovableColumns = !isUnlocked()
        })
    },
})

const describeOrder = (columns: IColumn[]) => [...columns]
    .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
    .map(column => column.displayName)
    .join(', ')

const GridExample = () => {
    const [isArranging, setIsArranging] = React.useState(false)
    const [order, setOrder] = React.useState('')
    const isArrangingRef = React.useRef(isArranging)
    const runtimeRef = React.useRef<IGridRuntime>()
    const columnOrderLock = React.useMemo(() => createColumnOrderLock(() => isArrangingRef.current), [])

    const toggleArranging = (checked: boolean) => {
        isArrangingRef.current = checked
        setIsArranging(checked)
        runtimeRef.current?.refreshAgGridOptions()
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Rearrange columns' inlineLabel checked={isArranging} onChange={(_, checked) => toggleArranging(!!checked)} />
        {order && <MessageBar onDismiss={() => setOrder('')}>The provider now holds this order: {order}</MessageBar>}
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), custom: [columnOrderLock] }}
            onGridReady={runtime => { runtimeRef.current = runtime }}
            onColumnsChanged={columns => setOrder(describeOrder(columns))}
            height='420px' />
    </Stack>
}
`

export const JUMP_TO_NEWEST_TICKET_CODE = `const isNewer = (ticket: IRecord, other: IRecord) => dayjs(ticket.getValue('createdon')).isAfter(other.getValue('createdon'))

const getNewestTicket = (tickets: IRecord[]) => tickets.reduce<IRecord | undefined>((newest, ticket) => !newest || isNewer(ticket, newest) ? ticket : newest, undefined)

const GridExample = () => {
    const runtimeRef = React.useRef<IGridRuntime>()

    const fitColumns = () => runtimeRef.current?.services.find('gridApi')?.autoSizeAllColumns()

    const jumpToNewestTicket = () => {
        const gridApi = runtimeRef.current?.services.find('gridApi')
        const newest = getNewestTicket(provider.getRecords())
        const node = newest && gridApi?.getRowNode(newest.getRecordId())
        if (!gridApi || !node) {
            return
        }
        gridApi.ensureNodeVisible(node, 'middle')
        gridApi.flashCells({ rowNodes: [node] })
    }

    const commands: ICommandBarItemProps[] = [
        { key: 'fit', text: 'Fit columns to content', iconProps: { iconName: 'FitWidth' }, onClick: fitColumns },
        { key: 'newest', text: 'Jump to the newest ticket', iconProps: { iconName: 'Ringer' }, onClick: jumpToNewestTicket },
    ]

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={commands} />
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
            enableOptionSetColors
            onGridReady={runtime => { runtimeRef.current = runtime }}
            height='400px' />
    </Stack>
}
`

const createQueueByDeadline = () => {
    const tickets = createTicketsProvider()
    tickets.setSorting([{ name: 'duedate', sortDirection: 0 }])
    tickets.refresh()
    return tickets
}

export const RearrangeColumnsExample = () => <GridExampleRunner seedCode={REARRANGE_COLUMNS_CODE} dataset='products' />

export const JumpToNewestTicketExample = () => <GridExampleRunner seedCode={JUMP_TO_NEWEST_TICKET_CODE} onCreateProvider={createQueueByDeadline} />
