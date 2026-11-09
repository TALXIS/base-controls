import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const WATCH_EVERY_EVENT_CODE = `interface ILogEntry {
    id: number
    time: string
    event: string
    detail: string
}

const styles = mergeStyleSets({
    layout: { display: 'flex', gap: 12 },
    grid: { flex: 1, minWidth: 0 },
    log: { width: 380, flexShrink: 0, height: 440, overflowY: 'auto', boxSizing: 'border-box', padding: '4px 8px', border: '1px solid #edebe9', borderRadius: 4, fontFamily: 'Consolas, Menlo, monospace', fontSize: 12, lineHeight: '20px' },
    time: { color: '#605e5c', marginRight: 8 },
    event: { fontWeight: 600, marginRight: 8 },
})

const ticketOf = (record: IRecord | undefined) => record ? String(record.getValue('ticketnumber')) : 'no record'

const describeSave = (result: IRecordSaveOperationResult) => {
    const ticket = ticketOf(provider.getRecordsMap()[result.recordId])
    return result.success ? ticket + ' saved ' + result.fields.join(', ') : ticket + ' refused: ' + (result.errors ?? []).map(error => error.message).join(' ')
}

const GridExample = () => {
    const [entries, setEntries] = React.useState<ILogEntry[]>([])
    const [isAutoSaveOn, setIsAutoSaveOn] = React.useState(true)
    const [mountCount, setMountCount] = React.useState(0)
    const lastEntryId = React.useRef(0)

    const log = (event: string, detail = '') => {
        const entry = { id: ++lastEntryId.current, time: dayjs().format('HH:mm:ss.SSS'), event, detail }
        setEntries(current => [entry, ...current])
    }

    const onSetup = (grid: IGrid) => {
        log('onSetup')
        grid.lifecycle.events.addEventListener('onReady', () => log('lifecycle onReady'))
        grid.services.observe('gridApi', () => {
            log('gridApi', 'AG Grid is ready')
            return () => log('gridApi cleanup', 'AG Grid still answers')
        })
        grid.events.addEventListener('onDataLoaded', () => log('onDataLoaded', provider.getRecords().length + ' tickets'))
        grid.services.get('columns').events.addEventListener('onCellDoubleClicked', (record, columnName) => log('onCellDoubleClicked', ticketOf(record) + ' ' + columnName))
        grid.services.get('columns').events.addEventListener('onColumnsChanged', columns => log('onColumnsChanged', columns.length + ' columns written back'))
        grid.services.get('rows').events.addEventListener('onRowClicked', record => log('onRowClicked', ticketOf(record)))
        grid.services.get('cells').events.addEventListener('onFocusedCellChanged', (record, columnName) => log('onFocusedCellChanged', record ? ticketOf(record) + ' ' + columnName : 'none'))
        grid.modules.observe('editing', editing => editing.events.addEventListener('onEditedCellChanged', (_previous: IGridEditedCell | undefined, cell: IGridEditedCell | undefined) => log('onEditedCellChanged', cell ? ticketOf(provider.getRecordsMap()[cell.recordId]) + ' ' + cell.columnName : 'none')))
        const removeProviderListeners = [
            provider.addEventListener('onLoading', isLoading => log('onLoading', String(isLoading))),
            provider.addEventListener('onRecordColumnValueChanged', (record, columnName) => log('onRecordColumnValueChanged', ticketOf(record) + ' ' + columnName + ' = ' + (record.getFormattedValue(columnName) ?? 'empty'))),
            provider.addEventListener('onBeforeRecordSaved', record => log('onBeforeRecordSaved', ticketOf(record))),
            provider.addEventListener('onAfterRecordSaved', result => log('onAfterRecordSaved', describeSave(result))),
            provider.addEventListener('onAfterSaved', results => log('onAfterSaved', results.length + ' record(s)')),
            provider.addEventListener('onError', message => log('onError', message)),
        ]
        grid.lifecycle.events.addEventListener('onDestroyed', () => {
            //the provider outlives the grid, so its listeners are removed by hand
            removeProviderListeners.forEach(remove => remove())
            log('lifecycle onDestroyed')
        })
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'remount', label: 'Remount', iconName: 'Sync', onExecute: () => setMountCount(count => count + 1) },
    ]

    return <div className={styles.layout}>
        <div className={styles.grid}>
            <DatasetControl onLoad={async () => ({ provider: provider })}>
                <DatasetControl.Header>
                    <DatasetControl.Header.Start>
                        <Toggle inlineLabel label='Auto-save' checked={isAutoSaveOn} onChange={(_, checked) => setIsAutoSaveOn(!!checked)} />
                        <DatasetControl.Ribbon enableSave enableRefresh onLoad={loadCommands} />
                    </DatasetControl.Header.Start>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    <ClientSideGrid
                        //modules are read at mount
                        key={mountCount + String(isAutoSaveOn)} modules={[createEditingModule({ enableAutoSave: isAutoSaveOn }), createSortingModule()]}
                        height='440px'
                        onSetup={onSetup}
                        onLoad={() => log('onLoad')} />
                </DatasetControl.Body>
            </DatasetControl>
        </div>
        <div className={styles.log}>
            {entries.length === 0 && <div className={styles.time}>Events show here as they fire, newest first.</div>}
            {entries.map(entry => <div key={entry.id}>
                <span className={styles.time}>{entry.time}</span>
                <span className={styles.event}>{entry.event}</span>
                {entry.detail}
            </div>)}
        </div>
    </div>
}
`

export const PREVIEW_PANE_CODE = `const FIELDS = ['ticketnumber', 'title', 'customer', 'priority', 'status', 'assignee', 'duedate']

const styles = mergeStyleSets({
    layout: { display: 'flex', gap: 16 },
    grid: { flex: 1, minWidth: 0 },
    pane: { width: 320, flexShrink: 0 },
})

const TicketForm = (props: { ticket: IRecord }) => <Form.Root key={props.ticket.getRecordId()} onLoad={async () => ({ record: props.ticket })}>
    <Form.Section cellLabelPosition='Top'>
        {FIELDS.map(columnName => <Form.Field key={columnName} name={columnName}>
            <Form.Cell><Form.Control /></Form.Cell>
        </Form.Field>)}
    </Form.Section>
</Form.Root>

const GridExample = () => {
    const [ticket, setTicket] = React.useState<IRecord>()
    const [openedTicket, setOpenedTicket] = React.useState<IRecord>()

    const onSetup = (grid: IGrid) => {
        grid.services.get('rows').events.addEventListener('onRowClicked', setTicket)
        grid.services.get('cells').events.addEventListener('onFocusedCellChanged', record => record && setTicket(record))
        grid.services.get('columns').events.addEventListener('onCellDoubleClicked', record => setOpenedTicket(record))
    }

    return <div className={styles.layout}>
        <div className={styles.grid}>
            <DatasetControl onLoad={async () => ({ provider: provider })}>
                <DatasetControl.Body>
                    <ClientSideGrid
                        //a double-click opens the ticket's panel
                        enableNavigation={false}
                        height='480px'
                        onSetup={onSetup} />
                </DatasetControl.Body>
            </DatasetControl>
        </div>
        <div className={styles.pane}>
            {ticket ? <TicketForm ticket={ticket} /> : 'Click a ticket, or move through the queue with the arrow keys.'}
        </div>
        <Panel isOpen={!!openedTicket} headerText={openedTicket?.getFormattedValue('title') ?? ''} isLightDismiss onDismiss={() => setOpenedTicket(undefined)}>
            {openedTicket && <TicketForm ticket={openedTicket} />}
        </Panel>
    </div>
}
`

export const WatchEveryEventExample = () => <GridExampleRunner seedCode={WATCH_EVERY_EVENT_CODE} dataset='tickets' />

export const TicketPreviewPaneExample = () => <GridExampleRunner seedCode={PREVIEW_PANE_CODE} dataset='tickets' />
