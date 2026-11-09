import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const REOPEN_QUEUE_CODE = `const createQueueProvider = () => {
    const tickets = createTicketsProvider()
    tickets.grouping.addGroupBy({ columnName: 'status', alias: 'status_group' })
    tickets.grouping.addGroupBy({ columnName: 'assignee', alias: 'assignee_group' })
    return tickets
}

const GridExample = () => {
    const tickets = React.useMemo(createQueueProvider, [])
    const [mountCount, setMountCount] = React.useState(0)
    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'reopen', label: 'Close and reopen', iconName: 'Refresh', onExecute: () => setMountCount(count => count + 1) },
    ]

    return <DatasetControl onLoad={async () => ({ provider: tickets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid
                //a new key mounts the grid again
                key={mountCount} modules={[createGroupingModule({ defaultExpandedLevel: 0 })]}
                //the scroll position, focused cell and open groups are kept under this key
                stateKey='ticket-queue'
                height='360px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const PREVIEW_STATE_CODE = `interface IPreviewState {
    recordId?: string
}

const createPreviewModule = (onOpen: (recordId: string) => void): IGridModule => ({
    name: 'preview',
    onLoad: grid => {
        //a key of your own beside the grid's viewport and grouping
        const state = grid.services.get('state')
        grid.services.observe('gridApi', gridApi => {
            const recordId = state.get<IPreviewState>('preview')?.recordId
            if (recordId) {
                onOpen(recordId)
            }
            gridApi.addEventListener('rowClicked', event => {
                const clickedId = event.data?.getRecordId()
                state.set<IPreviewState>('preview', { recordId: clickedId })
                if (clickedId) {
                    onOpen(clickedId)
                }
            })
        })
    },
})

const GridExample = () => {
    const [previewId, setPreviewId] = React.useState<string>()
    const [mountCount, setMountCount] = React.useState(0)
    const preview = React.useMemo(() => createPreviewModule(setPreviewId), [])
    const ticket = previewId ? provider.getRecordsMap()[previewId] : undefined

    const reopen = () => {
        setPreviewId(undefined)
        setMountCount(count => count + 1)
    }

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DefaultButton iconProps={{ iconName: 'Refresh' }} text='Close and reopen' onClick={reopen} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        {ticket && <MessageBar>Previewing {ticket.getFormattedValue('ticketnumber')}: {ticket.getFormattedValue('title')}</MessageBar>}
        <DatasetControl.Body>
            <ClientSideGrid key={mountCount} modules={[preview]} stateKey='ticket-preview' height='360px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

/** A ticket queue, grouped by status and assignee, that is closed and reopened where the user left it. */
export const ReopenQueueExample = () => <GridExampleRunner seedCode={REOPEN_QUEUE_CODE} tabs={['preview', 'code']} />

/** A preview module that keeps the ticket it shows in the grid's state. */
export const PreviewStateExample = () => <GridExampleRunner seedCode={PREVIEW_STATE_CODE} dataset='tickets' />
