import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTimesheetsProvider } from '../data'

export const LOG_HOURS_CODE = `const getWorkDone = (recordId: string) => provider.getRecordsMap()[recordId]?.getValue('description')

const GridExample = () => {
    const [status, setStatus] = React.useState('Change the hours of an entry: it saves as soon as you leave the cell.')

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{status}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableEditing
            enableAutoSave
            onBeforeRecordSaved={record => setStatus(\`Saving '\${record.getValue('description')}'...\`)}
            onAfterRecordSaved={result => setStatus(result.success ? \`Saved '\${getWorkDone(result.recordId)}'.\` : \`'\${getWorkDone(result.recordId)}' was not saved.\`)}
            height='420px' />
    </Stack>
}
`

export const REVIEW_CHANGES_CODE = `const entries = (count: number) => count === 1 ? '1 entry' : \`\${count} entries\`

const GridExample = () => {
    const [changedCount, setChangedCount] = React.useState(provider.getDirtyRecordIds().length)
    const [message, setMessage] = React.useState('')
    const countChanged = () => setChangedCount(provider.getDirtyRecordIds().length)

    const saveAll = async () => {
        const results = await provider.save()
        const refused = results.filter(result => !result.success).length
        setMessage(refused > 0 ? \`\${refused} of \${entries(results.length)} refused: see the red icons on their rows.\` : \`Saved \${entries(results.length)}.\`)
    }

    const discard = () => {
        provider.clearChanges()
        setMessage('Changes discarded.')
    }

    const commands: ICommandBarItemProps[] = [
        { key: 'save', text: \`Save \${entries(changedCount)}\`, iconProps: { iconName: 'Save' }, disabled: changedCount === 0, onClick: () => { saveAll() } },
        { key: 'discard', text: 'Discard', iconProps: { iconName: 'Undo' }, disabled: changedCount === 0, onClick: discard },
    ]

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={commands} />
        {message && <MessageBar onDismiss={() => setMessage('')}>{message}</MessageBar>}
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableEditing
            onRecordValueChanged={countChanged}
            onAfterSaved={countChanged}
            height='400px' />
    </Stack>
}
`

export const CHECK_HOURS_CODE = `const APPLICATION_REQUIRED = 2
const REJECTED = 4

const createTimesheets = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.setColumns(timesheets.getColumns().map(column => column.name === 'description' ? { ...column, metadata: { ...column.metadata, RequiredLevel: APPLICATION_REQUIRED } } : column))
    timesheets.refresh()
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

    return <Grid.Root
        provider={timesheets}
        modules={{ rowModel: createClientSideRowModelModule() }}
        colDefs={{
            hours: { settings: { cell: { onGetValidation: validateHours } } },
            comment: { settings: { cell: { onGetValidation: validateComment } } },
        }}
        enableEditing
        enableAutoSave
        height='420px' />
}
`

export const FREEZE_APPROVED_CODE = `const APPROVED = 3

//a two-options value reads as '1' or '0'
const isBillable = (record: IRecord) => record.getValue('billable') === '1'

const GridExample = () => {
    const [isWeekClosed, setIsWeekClosed] = React.useState(false)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Close the week' inlineLabel checked={isWeekClosed} onChange={(_, checked) => setIsWeekClosed(!!checked)} />
        <Grid.Root
            key={isWeekClosed ? 'closed' : 'open'}
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            enableEditing={!isWeekClosed}
            enableAutoSave
            rowSettings={{
                onGetLock: (result, { record }) => {
                    if (Number(record.getValue('status')) === APPROVED) {
                        result.isLocked = true
                    }
                },
            }}
            colDefs={{
                employee: { settings: { isLocked: true } },
                rate: {
                    settings: {
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
    </Stack>
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
    timesheets.refresh()
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createTimesheets, [])

    return <Grid.Root
        provider={timesheets}
        modules={{ rowModel: createClientSideRowModelModule() }}
        enableEditing
        enableAutoSave
        height='420px' />
}
`

export const TICK_BILLABLE_CODE = `//a two-options value reads as '1' or '0'
const isBillable = (record: IRecord) => record.getValue('billable') === '1'

const getAmountToInvoice = () => provider.getRecords()
    .filter(isBillable)
    .reduce((total, record) => total + Number(record.getValue('hours') ?? 0) * Number(record.getValue('rate') ?? 0), 0)

const GridExample = () => {
    const [amountToInvoice, setAmountToInvoice] = React.useState(getAmountToInvoice)

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>To invoice for last week: {amountToInvoice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{ rowModel: createClientSideRowModelModule() }}
            colDefs={{ billable: { settings: { cell: { oneClickEdit: true } } } }}
            enableEditing
            enableAutoSave
            onRecordValueChanged={() => setAmountToInvoice(getAmountToInvoice())}
            height='420px' />
    </Stack>
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
