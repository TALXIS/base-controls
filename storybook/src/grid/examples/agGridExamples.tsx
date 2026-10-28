import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTicketsProvider } from '../data'

export const REARRANGE_COLUMNS_CODE = `const createColumnOrderLock = (isUnlocked: () => boolean): IGridModule => ({
    name: 'columnOrderLock',
    onLoad: grid => {
        grid.registerAgGridOptions(result => {
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
    const gridRef = React.useRef<IGrid>()
    const columnOrderLock = React.useMemo(() => createColumnOrderLock(() => isArrangingRef.current), [])

    const toggleArranging = (checked: boolean) => {
        isArrangingRef.current = checked
        setIsArranging(checked)
        gridRef.current?.refreshAgGridOptions()
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <Toggle label='Rearrange columns' inlineLabel checked={isArranging} onChange={(_, checked) => toggleArranging(!!checked)} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        {order && <MessageBar onDismiss={() => setOrder('')}>The provider now holds this order: {order}</MessageBar>}
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), columnOrderLock]}
                onReady={grid => { gridRef.current = grid }}
                onColumnsChanged={columns => setOrder(describeOrder(columns))}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const JUMP_TO_NEWEST_TICKET_CODE = `//\`flashCells\` needs an AG Grid module the grid does not register itself
const highlightChangesModule: IGridModule = { name: 'highlightChanges', agGridModules: [HighlightChangesModule], onLoad: () => { } }

const isNewer = (ticket: IRecord, other: IRecord) => dayjs(ticket.getValue('createdon')).isAfter(other.getValue('createdon'))

const getNewestTicket = (tickets: IRecord[]) => tickets.reduce<IRecord | undefined>((newest, ticket) => !newest || isNewer(ticket, newest) ? ticket : newest, undefined)

const GridExample = () => {
    const gridRef = React.useRef<IGrid>()

    const fitColumns = () => gridRef.current?.services.find('gridApi')?.autoSizeAllColumns()

    const jumpToNewestTicket = () => {
        const gridApi = gridRef.current?.services.find('gridApi')
        const newest = getNewestTicket(provider.getRecords())
        const node = newest && gridApi?.getRowNode(newest.getRecordId())
        if (!gridApi || !node) {
            return
        }
        gridApi.ensureNodeVisible(node, 'middle')
        //the grid draws the row it scrolled to a frame later
        requestAnimationFrame(() => requestAnimationFrame(() => gridApi.flashCells({ rowNodes: [node] })))
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'fit', label: 'Fit columns to content', iconName: 'FitWidth', onExecute: fitColumns },
        { id: 'newest', label: 'Jump to the newest ticket', iconName: 'Ringer', onExecute: jumpToNewestTicket },
    ]

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createSortingModule(), highlightChangesModule]}
                enableOptionSetColors
                onReady={grid => { gridRef.current = grid }}
                height='400px' />
        </DatasetControl.Body>
    </DatasetControl>
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
