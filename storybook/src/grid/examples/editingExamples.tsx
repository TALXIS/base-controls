import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createTimesheetsProvider } from '../data'

export const LOG_HOURS_CODE = `const getWorkDone = (recordId: string) => provider.getRecordsMap()[recordId]?.getValue('description')

const GridExample = () => {
    const [status, setStatus] = React.useState('Change the hours of an entry: it saves as soon as you leave the cell.')

    //the provider raises the save events
    React.useEffect(() => {
        const removeBefore = provider.addEventListener('onBeforeRecordSaved', record => setStatus(\`Saving '\${record.getValue('description')}'...\`))
        const removeAfter = provider.addEventListener('onAfterRecordSaved', result => setStatus(result.success ? \`Saved '\${getWorkDone(result.recordId)}'.\` : \`'\${getWorkDone(result.recordId)}' was not saved.\`))
        return () => {
            removeBefore()
            removeAfter()
        }
    }, [])

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <MessageBar>{status}</MessageBar>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true })]}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const REVIEW_CHANGES_CODE = `const entries = (count: number) => count === 1 ? '1 entry' : \`\${count} entries\`

const GridExample = () => {
    const [message, setMessage] = React.useState('')

    const onAfterSaved = (results: IRecordSaveOperationResult[]) => {
        const refused = results.filter(result => !result.success).length
        setMessage(refused > 0 ? \`\${refused} of \${entries(results.length)} refused: see the red icons on their rows.\` : \`Saved \${entries(results.length)}.\`)
    }

    //fires once provider.save() has saved every record
    React.useEffect(() => provider.addEventListener('onAfterSaved', onAfterSaved), [])

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon enableSave enableDiscard />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        {message && <MessageBar onDismiss={() => setMessage('')}>{message}</MessageBar>}
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule()]}
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

const validateHours: GridValidationHook = (result, { record }) => {
    const hours = Number(record.getValue('hours') ?? 0)
    if (hours < 0.25 || hours > 12) {
        result.error = true
        result.errorMessage = 'Log between 0.25 and 12 hours.'
    }
}

const validateComment: GridValidationHook = (result, { record }) => {
    if (Number(record.getValue('status')) === REJECTED && !record.getValue('comment')) {
        result.error = true
        result.errorMessage = 'Say why the entry was rejected.'
    }
}

const VALIDATION_HOOKS: { [columnName: string]: GridValidationHook } = {
    hours: validateHours,
    comment: validateComment,
}

const onSetup = (grid: IGrid) => {
    //runs for every column of every record
    grid.services.get('validation').hooks.validation.add((result, parameters) => VALIDATION_HOOKS[parameters.columnName]?.(result, parameters))
}

const GridExample = () => {
    const timesheets = React.useMemo(createTimesheets, [])

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true })]}
                onSetup={onSetup}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const FREEZE_APPROVED_CODE = `const APPROVED = 3

const LOCK_LABELS = {
    'grid.columnLocked': 'An entry stays with the employee who logged it.',
    'grid.recordLocked': 'Approved entries cannot be changed.',
    'grid.valueLocked': 'Only billable work has an hourly rate.',
}

//a two-options value reads as '1' or '0'
const isBillable = (record: IRecord) => record.getValue('billable') === '1'

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const employee = columnDefs.find(colDef => colDef.colId === 'employee')!
        employee.context = { ...employee.context, isLocked: true }
    })
    //the locks belong to the editing module, which the grid has only while the week is open
    grid.modules.observe('editing', editing => editing.locks.hooks.lock.add((result, { record, columnName }) => {
        //a record without a columnName asks about the whole row
        if (record && !columnName && Number(record.getValue('status')) === APPROVED) {
            result.isLocked = true
        }
        if (record && columnName === 'rate' && !isBillable(record)) {
            result.isLocked = true
        }
    }))
}

const GridExample = () => {
    const [isWeekClosed, setIsWeekClosed] = React.useState(false)

    return <LabelsProvider labels={LOCK_LABELS}>
        <DatasetControl onLoad={async () => ({ provider: provider })}>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <Toggle label='Close the week' inlineLabel checked={isWeekClosed} onChange={(_, checked) => setIsWeekClosed(!!checked)} />
                </DatasetControl.Header.Start>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid
                    key={isWeekClosed ? 'closed' : 'open'}
                    modules={[createClientSideRowModelModule(), ...(isWeekClosed ? [] : [createEditingModule({ enableAutoSave: true })])]}
                    onSetup={onSetup}
                    height='440px' />
            </DatasetControl.Body>
        </DatasetControl>
    </LabelsProvider>
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
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true })]}
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

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const billable = columnDefs.find(colDef => colDef.colId === 'billable')!
        billable.context = { ...billable.context, cell: { ...billable.context?.cell, enableOneClickEdit: true } }
    })
}

const GridExample = () => {
    const [amountToInvoice, setAmountToInvoice] = React.useState(getAmountToInvoice)

    React.useEffect(() => provider.addEventListener('onRecordColumnValueChanged', () => setAmountToInvoice(getAmountToInvoice())), [])

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <MessageBar>To invoice for last week: {amountToInvoice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</MessageBar>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true })]}
                onSetup={onSetup}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const SAVE_STATUS_CODE = `const PRICE_APPROVAL_LIMIT = 1000

//stands in for a pricing service that sends big prices to a manager first
const createPriceList = () => {
    const products = createProductsProvider()
    products.setInterceptor('onRecordSave', async (product, defaultAction) => {
        await new Promise(resolve => setTimeout(resolve, 600))
        if (product.isDirty('price') && Number(product.getValue('price') ?? 0) > PRICE_APPROVAL_LIMIT) {
            return { recordId: product.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'price', message: "A price over $1,000 needs the category manager's approval." }] }
        }
        return defaultAction(product)
    })
    return products
}

//the callout is drawn inside the product's cell
const SaveErrorTitle = (props: ITextProps) => {
    const product = useGridCell().getRecord()
    return <Text {...props}>{product.getFormattedValue('name')}: {props.children}</Text>
}

const SAVE_STATUS: IRecordSaveUiComponents = {
    indicator: {
        onRenderButton: ({ state, ...props }) => <ActionButton {...props} text={state === 'failed' ? 'Not saved' : 'Saved'} />,
    },
    errorCallout: {
        onRenderTitle: props => <SaveErrorTitle {...props} />,
    },
}

const onSetup = (grid: IGrid) => {
    //runs after the editing module has added its save status column
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        const saveStatus = columnDefs.find(colDef => colDef.colId === RECORD_SAVE_COLUMN_KEY)!
        //wide enough for the button's text
        saveStatus.width = 112
        saveStatus.cellRendererParams = { components: SAVE_STATUS }
    }, GRID_MODULE_PRIORITY.editing + 1)
}

const GridExample = () => {
    const products = React.useMemo(createPriceList, [])

    return <DatasetControl onLoad={async () => ({ provider: products })}>
        <DatasetControl.Body>
            <Grid
                modules={[createClientSideRowModelModule(), createEditingModule({ enableAutoSave: true })]}
                onSetup={onSetup}
                height='440px' />
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

export const CheckHoursExample = () => <GridExampleRunner seedCode={CHECK_HOURS_CODE} tabs={['preview', 'code']} />

export const FreezeApprovedExample = () => <GridExampleRunner seedCode={FREEZE_APPROVED_CODE} dataset='timesheets' />

export const ServerRefusesExample = () => <GridExampleRunner seedCode={SERVER_REFUSES_CODE} tabs={['preview', 'code']} />

export const TickBillableExample = () => <GridExampleRunner seedCode={TICK_BILLABLE_CODE} dataset='timesheets' />

export const SaveStatusExample = () => <GridExampleRunner seedCode={SAVE_STATUS_CODE} tabs={['preview', 'code']} />
