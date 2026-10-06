import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const INVOICE_LINES_CODE = `const CATALOGUE = [
    { item: 'Standing desk', unitprice: 640 },
    { item: 'Ergonomic chair', unitprice: 410 },
    { item: 'Monitor arm', unitprice: 85 },
    { item: 'Desk lamp', unitprice: 45 },
    { item: 'Filing cabinet', unitprice: 230 },
    { item: 'Footrest', unitprice: 35 },
    { item: 'Whiteboard', unitprice: 140 },
    { item: 'Cable tray', unitprice: 25 },
]

const toLine = (index: number): IRawRecord => ({ lineid: 'line-' + (index + 1), ...CATALOGUE[index % CATALOGUE.length], quantity: (index % 3) + 1 })

const createInvoiceLines = () => new MemoryDataProvider({
    dataSource: [0, 1, 2].map(toLine),
    metadata: { PrimaryIdAttribute: 'lineid', PrimaryNameAttribute: 'item', LogicalName: 'invoiceline' },
    columns: [
        { name: 'item', displayName: 'Item', dataType: DataTypes.SingleLineText, visualSizeFactor: 280 },
        { name: 'quantity', displayName: 'Quantity', dataType: DataTypes.WholeNone, visualSizeFactor: 100 },
        { name: 'unitprice', displayName: 'Unit price', dataType: DataTypes.Currency, visualSizeFactor: 120 },
    ],
})

const GridExample = () => {
    const lines = React.useMemo(createInvoiceLines, [])
    const [lineCount, setLineCount] = React.useState(3)
    const [maxVisibleRows, setMaxVisibleRows] = React.useState(6)

    const showLines = (count: number) => {
        lines.setDataSource(Array.from({ length: count }, (_, index) => toLine(index)))
        lines.refresh()
        setLineCount(count)
    }

    const commands: ICommandBarItemProps[] = [
        { key: 'add', text: 'Add line', iconProps: { iconName: 'Add' }, onClick: () => showLines(lineCount + 1) },
        { key: 'remove', text: 'Remove last line', iconProps: { iconName: 'Remove' }, disabled: lineCount === 0, onClick: () => showLines(lineCount - 1) },
    ]

    const rowsSlider: ICommandBarItemProps = {
        key: 'maxVisibleRows',
        onRender: () => <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 12 }}>
            <Text>Rows before it scrolls</Text>
            <Slider min={3} max={15} value={maxVisibleRows} onChange={setMaxVisibleRows} showValue styles={{ root: { width: 200 } }} />
        </Stack>,
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={commands} farItems={[rowsSlider]} />
        <Grid.Root provider={lines} modules={{ rowModel: createClientSideRowModelModule() }} maxVisibleRows={maxVisibleRows} />
    </Stack>
}
`

export const FILL_CONTAINER_CODE = `const styles = mergeStyleSets({
    container: { border: '1px solid #edebe9', borderRadius: 4, overflow: 'hidden' },
})

const GridExample = () => {
    const [containerHeight, setContainerHeight] = React.useState(360)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Slider label='Container height' min={220} max={700} step={20} value={containerHeight} onChange={setContainerHeight} showValue valueFormat={value => value + 'px'} styles={{ root: { width: 300 } }} />
        <div className={styles.container} style={{ height: containerHeight }}>
            <Grid.Root provider={provider} modules={{ rowModel: createClientSideRowModelModule() }} height='100%' />
        </div>
    </Stack>
}
`

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

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal wrap verticalAlign='center' tokens={{ childrenGap: 8 }}>
            <Toggle inlineLabel label='Auto-save' checked={isAutoSaveOn} onChange={(_, checked) => setIsAutoSaveOn(!!checked)} styles={{ root: { margin: '0 8px 0 0' } }} />
            <DefaultButton iconProps={{ iconName: 'Refresh' }} text='Reload' onClick={() => provider.refresh()} />
            <DefaultButton iconProps={{ iconName: 'Save' }} text='Save all' onClick={() => provider.save()} />
            <DefaultButton iconProps={{ iconName: 'Sync' }} text='Remount' onClick={() => setMountCount(count => count + 1)} />
            <DefaultButton iconProps={{ iconName: 'Clear' }} text='Clear log' onClick={() => setEntries([])} />
        </Stack>
        <div className={styles.layout}>
            <div className={styles.grid}>
                <Grid.Root
                    //the modules are read at mount, so auto-save mounts the grid again
                    key={mountCount + String(isAutoSaveOn)}
                    provider={provider}
                    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: isAutoSaveOn, onEditedCellChanged: (_previous, cell) => log('onEditedCellChanged', cell ? ticketOf(provider.getRecordsMap()[cell.recordId]) + ' ' + cell.columnName : 'none') }), sorting: createSortingModule() }}
                    height='440px'
                    onGridReady={() => log('onGridReady')}
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
    </Stack>
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

const createTicketStrategy = (ticket: IRecord) => new MemoryStrategy({
    onGetColumns: () => provider.getColumns(),
    onGetData: () => ({ ...ticket.getRawData() }),
    onGetMetadata: () => ({ PrimaryIdAttribute: provider.getMetadata().PrimaryIdAttribute, PrimaryNameAttribute: 'title' }),
})

interface ITicketFormProps {
    ticket: IRecord
    /** How many fields a section puts side by side. */
    columnsPerSection?: number
}

const TicketForm = (props: ITicketFormProps) => {
    const strategy = React.useMemo(() => createTicketStrategy(props.ticket), [props.ticket])
    //every change is saved into the record the grid shows
    const saveChange = async (columnName: string, value: unknown) => {
        props.ticket.setValue(columnName, value)
        await props.ticket.save()
    }

    return <Form.Root strategy={strategy} onFieldValueChanged={(columnName, value) => { saveChange(columnName, value) }}>
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
            <Grid.Root
                provider={provider}
                modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }}
                enableNavigation={false}
                height='480px'
                onRowClicked={setTicket}
                onFocusedCellChanged={record => record && setTicket(record)}
                onCellDoubleClicked={record => setOpenedTicket(record)} />
        </div>
        <div className={styles.pane}>
            {ticket
                ? <TicketForm key={ticket.getRecordId()} ticket={ticket} />
                : <span>Click a ticket, or move through the queue with the arrow keys.</span>}
        </div>
        <Panel isOpen={!!openedTicket} type={PanelType.medium} headerText={openedTicket?.getFormattedValue('title') ?? ''} isLightDismiss onDismiss={() => setOpenedTicket(undefined)}>
            {openedTicket && <TicketForm ticket={openedTicket} columnsPerSection={2} />}
        </Panel>
    </div>
}
`

export const InvoiceLinesExample = () => <GridExampleRunner seedCode={INVOICE_LINES_CODE} />

export const FillContainerExample = () => <GridExampleRunner seedCode={FILL_CONTAINER_CODE} />

export const WatchEveryEventExample = () => <GridExampleRunner seedCode={WATCH_EVERY_EVENT_CODE} dataset='tickets' />

export const TicketPreviewPaneExample = () => <GridExampleRunner seedCode={PREVIEW_PANE_CODE} dataset='tickets' />
