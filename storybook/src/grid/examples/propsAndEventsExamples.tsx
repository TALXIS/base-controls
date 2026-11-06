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
        setEntries(current => [entry, ...current].slice(0, 200))
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'remount', label: 'Remount', iconName: 'Sync', onExecute: () => setMountCount(count => count + 1) },
        { id: 'clear', label: 'Clear log', iconName: 'Clear', onExecute: () => setEntries([]) },
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
                    <Grid
                        //modules are read at mount
                        key={mountCount + String(isAutoSaveOn)}
                        modules={[createClientSideRowModelModule(), createEditingModule({ autoSave: isAutoSaveOn, onEditedCellChanged: (_previous, cell) => log('onEditedCellChanged', cell ? ticketOf(provider.getRecordsMap()[cell.recordId]) + ' ' + cell.columnName : 'none') }), createSortingModule()]}
                        height='440px'
                        onReady={() => log('onReady')}
                        onDestroyed={() => log('onDestroyed')}
                        onDataLoaded={() => log('onDataLoaded', provider.getRecords().length + ' tickets')}
                        onLoadingChanged={isLoading => log('onLoadingChanged', String(isLoading))}
                        onRecordValueChanged={(record, columnName) => log('onRecordValueChanged', ticketOf(record) + ' ' + columnName + ' = ' + (record.getFormattedValue(columnName) ?? 'empty'))}
                        onBeforeRecordSaved={record => log('onBeforeRecordSaved', ticketOf(record))}
                        onAfterRecordSaved={result => log('onAfterRecordSaved', describeSave(result))}
                        onAfterSaved={results => log('onAfterSaved', results.length + ' record(s)')}
                        onError={message => log('onError', message)}
                        onCellDoubleClicked={(record, columnName) => log('onCellDoubleClicked', ticketOf(record) + ' ' + columnName)}
                        onRowClicked={record => log('onRowClicked', ticketOf(record))}
                        onFocusedCellChanged={(record, columnName) => log('onFocusedCellChanged', record ? ticketOf(record) + ' ' + columnName : 'none')}
                        onColumnsChanged={columns => log('onColumnsChanged', columns.length + ' columns written back')} />
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

export const PREVIEW_PANE_CODE = `const SECTIONS = [
    { label: 'Ticket', columnNames: ['ticketnumber', 'title', 'customer', 'channel'] },
    { label: 'Handling', columnNames: ['priority', 'status', 'assignee', 'escalated'] },
    { label: 'Timing', columnNames: ['createdon', 'duedate', 'timespent'] },
]

const styles = mergeStyleSets({
    layout: { display: 'flex', gap: 16 },
    grid: { flex: 1, minWidth: 0 },
    pane: { width: 320, flexShrink: 0, maxHeight: 480, overflowY: 'auto', paddingLeft: 16, borderLeft: '1px solid #edebe9' },
})

interface ITicketFormProps {
    ticket: IRecord
    /** How many fields a section puts side by side. */
    columnsPerSection?: number
}

const TicketForm = (props: ITicketFormProps) => {
    return <Form.Root key={props.ticket.getRecordId()} onLoad={async () => ({ record: props.ticket })}>
        {SECTIONS.map(section => <Form.Section key={section.label} label={section.label} layout={{ lg: props.columnsPerSection ?? 1 }} cellLabelPosition='Top'>
            {section.columnNames.map(columnName => <Form.Field key={columnName} name={columnName}>
                <Form.Cell>
                    <Form.Control />
                </Form.Cell>
            </Form.Field>)}
        </Form.Section>)}
    </Form.Root>
}

const GridExample = () => {
    const [ticket, setTicket] = React.useState<IRecord>()
    const [openedTicket, setOpenedTicket] = React.useState<IRecord>()

    return <div className={styles.layout}>
        <div className={styles.grid}>
            <DatasetControl onLoad={async () => ({ provider: provider })}>
                <DatasetControl.Body>
                    <Grid
                        modules={[createClientSideRowModelModule(), createSortingModule()]}
                        //a double-click opens the ticket's panel
                        enableNavigation={false}
                        height='480px'
                        onRowClicked={setTicket}
                        onFocusedCellChanged={record => record && setTicket(record)}
                        onCellDoubleClicked={record => setOpenedTicket(record)} />
                </DatasetControl.Body>
            </DatasetControl>
        </div>
        <div className={styles.pane}>
            {ticket
                ? <TicketForm key={ticket.getRecordId()} ticket={ticket} />
                : <span>Click a ticket, or move through the queue with the arrow keys.</span>}
        </div>
        <Panel isOpen={!!openedTicket} headerText={openedTicket?.getValue('title')} type={PanelType.medium} isLightDismiss onDismiss={() => setOpenedTicket(undefined)} onRenderFooterContent={() => <DefaultButton text='Close' onClick={() => setOpenedTicket(undefined)} />}>
            {openedTicket && <TicketForm ticket={openedTicket} columnsPerSection={2} />}
        </Panel>
    </div>
}
`

export const WatchEveryEventExample = () => <GridExampleRunner seedCode={WATCH_EVERY_EVENT_CODE} dataset='tickets' />

export const TicketPreviewPaneExample = () => <GridExampleRunner seedCode={PREVIEW_PANE_CODE} dataset='tickets' />
