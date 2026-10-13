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
            <Grid
                key={mountCount}
                modules={{ rowModel: createClientSideRowModelModule(), grouping: createGroupingModule({ defaultExpandedLevel: 0 }) }}
                stateKey='ticket-queue'
                height='360px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

/** A ticket queue, grouped by status and assignee, that is closed and reopened where the user left it. */
export const ReopenQueueExample = () => <GridExampleRunner seedCode={REOPEN_QUEUE_CODE} dataset='tickets' />
