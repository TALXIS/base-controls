import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const REARRANGE_COLUMNS_CODE = `const createColumnOrderLock = (isUnlocked: () => boolean): IGridModule => ({
    name: 'columnOrderLock',
    onLoad: grid => {
        //screen readers read the rows in the order the page holds them
        grid.hooks.agGridInitialOptions.add(result => {
            result.options.ensureDomOrder = true
        })
        grid.hooks.agGridOptions.add(result => {
            result.options.suppressMovableColumns = !isUnlocked()
        })
    },
})

const GridExample = () => {
    const [isArranging, setIsArranging] = React.useState(false)
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
        <DatasetControl.Body>
            <ClientSideGrid modules={[columnOrderLock]}
                onSetup={grid => { gridRef.current = grid }}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const JUMP_TO_NEWEST_TICKET_CODE = `//\`flashCells\` needs an AG Grid module the grid does not register itself
const highlightChangesModule: IGridModule = { name: 'highlightChanges', agGridModules: [HighlightChangesModule], onLoad: () => { } }

const getNewestTicket = (tickets: IRecord[]) => tickets.reduce((newest, ticket) => dayjs(ticket.getValue('createdon')).isAfter(newest.getValue('createdon')) ? ticket : newest)

//opens sorted by deadline
const createQueueByDeadline = () => {
    const tickets = createTicketsProvider()
    tickets.setSorting([{ name: 'duedate', sortDirection: 0 }])
    return tickets
}

const GridExample = () => {
    const tickets = React.useMemo(createQueueByDeadline, [])
    const gridRef = React.useRef<IGrid>()

    const jumpToNewestTicket = () => {
        const gridApi = gridRef.current?.services.find('gridApi')
        const node = gridApi?.getRowNode(getNewestTicket(tickets.getRecords()).getRecordId())
        if (!gridApi || !node) {
            return
        }
        gridApi.ensureNodeVisible(node, 'middle')
        //the grid draws the row it scrolled to a frame later
        requestAnimationFrame(() => requestAnimationFrame(() => gridApi.flashCells({ rowNodes: [node] })))
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'newest', label: 'Jump to the newest ticket', iconName: 'Ringer', onExecute: jumpToNewestTicket },
    ]

    return <DatasetControl onLoad={async () => ({ provider: tickets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid modules={[highlightChangesModule]}
                onSetup={grid => { gridRef.current = grid }}
                height='400px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const RearrangeColumnsExample = () => <GridExampleRunner seedCode={REARRANGE_COLUMNS_CODE} dataset='products' />

export const JumpToNewestTicketExample = () => <GridExampleRunner seedCode={JUMP_TO_NEWEST_TICKET_CODE} tabs={['preview', 'code']} />
