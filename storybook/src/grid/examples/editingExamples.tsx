import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTimesheetsProvider } from '../data'

export const LOG_HOURS_CODE = `const getWorkDone = (recordId: string) => provider.getRecordsMap()[recordId]?.getValue('description')

const GridExample = () => {
    const [status, setStatus] = React.useState('Change the hours of an entry: it saves as soon as you leave the cell.')

    return <DatasetControl onLoad={async () => ({ provider: provider })} onMounted={datasetControl => control.current = datasetControl}>
        <MessageBar>{status}</MessageBar>
        <DatasetControl.Body>
            <Grid
                modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
                onBeforeRecordSaved={record => setStatus(\`Saving '\${record.getValue('description')}'...\`)}
                onAfterRecordSaved={result => setStatus(result.success ? \`Saved '\${getWorkDone(result.recordId)}'.\` : \`'\${getWorkDone(result.recordId)}' was not saved.\`)}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const REVIEW_CHANGES_CODE = `const entries = (count: number) => count === 1 ? '1 entry' : \`\${count} entries\`

const GridExample = () => {
    const control = React.useRef<IDatasetControl>()
    const [message, setMessage] = React.useState('')

    const saveAll = async () => {
        const results = await provider.save()
        const refused = results.filter(result => !result.success).length
        setMessage(refused > 0 ? \`\${refused} of \${entries(results.length)} refused: see the red icons on their rows.\` : \`Saved \${entries(results.length)}.\`)
    }

    const discard = () => {
        provider.clearChanges()
        setMessage('Changes discarded.')
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => {
        const changedCount = provider.getDirtyRecordIds().length
        return [
            { id: 'save', label: \`Save \${entries(changedCount)}\`, iconName: 'Save', isDisabled: changedCount === 0, onExecute: saveAll },
            { id: 'discard', label: 'Discard', iconName: 'Undo', isDisabled: changedCount === 0, onExecute: discard },
        ]
    }

    //the ribbon reloads on its own only when the selection changes
    const reloadCommands = () => control.current?.parts.find('ribbon')?.reload()

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        {message && <MessageBar onDismiss={() => setMessage('')}>{message}</MessageBar>}
        <DatasetControl.Body>
            <Grid
                modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule() }}
                onRecordValueChanged={reloadCommands}
                onAfterSaved={reloadCommands}
                height='400px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const CHECK_HOURS_CODE = `const APPLICATION_REQUIRED = 2
const REJECTED = 4

const createTimesheets = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.setColumns(timesheets.getColumns().map(column => column.name === 'description' ? { ...column, metadata: { ...column.metadata, RequiredLevel: APPLICATION_REQUIRED } } : column))
    return timesheets
}

const validateHours = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    const hours = Number(record.getValue('hours') ?? 0)
    if (hours < 0.25 || hours > 12) {
        result.error = true
        result.errorMessage = 'Log between 0.25 and 12 hours.'
    }
}

const validateComment = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    if (Number(record.getValue('status')) === REJECTED && !record.getValue('comment')) {
        result.error = true
        result.errorMessage = 'Say why the entry was rejected.'
    }
}

const GridExample = () => {
    const timesheets = React.useMemo(createTimesheets, [])

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Body>
            <Grid
                modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
                colDefs={{
                    hours: { context: { cell: { onGetValidation: validateHours } } },
                    comment: { context: { cell: { onGetValidation: validateComment } } },
                }}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const FREEZE_APPROVED_CODE = `const APPROVED = 3

//a two-options value reads as '1' or '0'
const isBillable = (record: IRecord) => record.getValue('billable') === '1'

const GridExample = () => {
    const [isWeekClosed, setIsWeekClosed] = React.useState(false)

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <Toggle label='Close the week' inlineLabel checked={isWeekClosed} onChange={(_, checked) => setIsWeekClosed(!!checked)} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                key={isWeekClosed ? 'closed' : 'open'}
                modules={{ rowModel: createClientSideRowModelModule(), editing: isWeekClosed ? undefined : createEditingModule({ autoSave: true }) }}
                rowSettings={{
                    onGetLock: (result, { record }) => {
                        if (Number(record.getValue('status')) === APPROVED) {
                            result.isLocked = true
                        }
                    },
                }}
                colDefs={{
                    employee: { context: { isLocked: true } },
                    rate: {
                        context: {
                            cell: {
                                onGetLock: (result, { record }) => {
                                    if (!isBillable(record)) {
                                        result.isLocked = true
                                    }
                                },
                            },
                        },
                    },
                }}
                labels={{
                    columnLocked: 'An entry stays with the employee who logged it.',
                    recordLocked: 'Approved entries cannot be changed.',
                    valueLocked: 'Only billable work has an hourly rate.',
                }}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const SERVER_REFUSES_CODE = `const daysSinceMonday = (dayjs().day() + 6) % 7
const lastWeeksWednesday = dayjs().startOf('day').subtract(daysSinceMonday + 5, 'day')
const MAX_HOURS_A_DAY = 8

const getHoursThatDay = (entry: IRecord) => entry.getDataProvider().getRecords()
    .filter(other => other.getValue('employee') === entry.getValue('employee') && other.getValue('date') === entry.getValue('date'))
    .reduce((total, other) => total + Number(other.getValue('hours') ?? 0), 0)

const createTimesheets = () => {
    const timesheets = createTimesheetsProvider()
    //stands in for a server that checks every entry it is sent
    timesheets.setInterceptor('onRecordSave', async (record, defaultAction) => {
        const errors: { fieldName: string; message: string }[] = []
        if (dayjs(record.getValue('date')).isBefore(lastWeeksWednesday)) {
            errors.push({ fieldName: 'date', message: 'Payroll for this day is closed.' })
        }
        if (getHoursThatDay(record) > MAX_HOURS_A_DAY) {
            errors.push({ fieldName: 'hours', message: \`More than \${MAX_HOURS_A_DAY} hours on one day needs an overtime request.\` })
        }
        if (errors.length > 0) {
            return { recordId: record.getRecordId(), success: false, fields: [], errors }
        }
        return defaultAction(record)
    })
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createTimesheets, [])

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Body>
            <Grid
                modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const TICK_BILLABLE_CODE = `//a two-options value reads as '1' or '0'
const isBillable = (record: IRecord) => record.getValue('billable') === '1'

const getAmountToInvoice = () => provider.getRecords()
    .filter(isBillable)
    .reduce((total, record) => total + Number(record.getValue('hours') ?? 0) * Number(record.getValue('rate') ?? 0), 0)

const GridExample = () => {
    const [amountToInvoice, setAmountToInvoice] = React.useState(getAmountToInvoice)

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <MessageBar>To invoice for last week: {amountToInvoice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</MessageBar>
        <DatasetControl.Body>
            <Grid
                modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
                colDefs={{ billable: { context: { cell: { oneClickEdit: true } } } }}
                onRecordValueChanged={() => setAmountToInvoice(getAmountToInvoice())}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

//a server takes a moment to answer
const createSlowTimesheetsProvider = () => {
    const provider = createTimesheetsProvider()
    provider.setInterceptor('onRecordSave', async (record, defaultAction) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        return defaultAction(record)
    })
    provider.refresh()
    return provider
}

export const LogHoursExample = () => <GridExampleRunner seedCode={LOG_HOURS_CODE} onCreateProvider={createSlowTimesheetsProvider} />

export const ReviewChangesExample = () => <GridExampleRunner seedCode={REVIEW_CHANGES_CODE} dataset='timesheets' />

export const CheckHoursExample = () => <GridExampleRunner seedCode={CHECK_HOURS_CODE} dataset='timesheets' />

export const FreezeApprovedExample = () => <GridExampleRunner seedCode={FREEZE_APPROVED_CODE} dataset='timesheets' />

export const ServerRefusesExample = () => <GridExampleRunner seedCode={SERVER_REFUSES_CODE} dataset='timesheets' />

export const TickBillableExample = () => <GridExampleRunner seedCode={TICK_BILLABLE_CODE} dataset='timesheets' />
