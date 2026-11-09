import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const TICKET_RECOMMENDATIONS_CODE = `const NEW = 1
const IN_PROGRESS = 2
const RESOLVED = 4
const CURRENT_AGENT = 'Eva Horák'

const getStatus = (record: IRecord) => Number(record.getValue('status'))
const isOpen = (record: IRecord) => getStatus(record) !== RESOLVED
const isOverdue = (record: IRecord) => [NEW, IN_PROGRESS].includes(getStatus(record)) && dayjs(record.getValue('duedate')).isBefore(dayjs())
//two-options values read back as '1' or '0'
const isEscalated = (record: IRecord) => record.getValue('escalated') === '1'

const update = (record: IRecord, values: { [columnName: string]: any }) => {
    Object.entries(values).forEach(([columnName, value]) => record.setValue(columnName, value))
    record.save()
}

const assignToMe = (record: IRecord) => update(record, { assignee: CURRENT_AGENT, status: IN_PROGRESS })

const getRecommendations = (record: IRecord): IAddControlNotificationOptions[] => {
    const notifications: IAddControlNotificationOptions[] = []
    if (isOverdue(record)) {
        notifications.push({
            uniqueId: 'overdue',
            iconName: 'Clock',
            text: 'Overdue',
            messages: ['The customer was due a first answer by ' + dayjs(record.getValue('duedate')).format('ddd D MMM, HH:mm') + '.'],
            actions: [
                { message: 'Assign to me', iconName: 'AddFriend', actions: [() => assignToMe(record)] },
                { message: 'Escalate', iconName: 'Up', actions: [() => update(record, { escalated: true })] },
            ],
        })
    }
    if (isOpen(record) && !record.getValue('assignee')) {
        notifications.push({
            uniqueId: 'unassigned',
            iconName: 'AddFriend',
            text: 'Assign to me',
            messages: [],
            buttonProps: { iconOnly: true },
            actions: [{ actions: [() => assignToMe(record)] }],
        })
    }
    if (isOpen(record) && isEscalated(record)) {
        notifications.push({
            uniqueId: 'escalated',
            iconName: 'Up',
            text: 'Escalated',
            messages: ['The second line is looking into it. Resolve the ticket once they answer, or take it back.'],
            buttonProps: { renderedInOverflow: true },
            actions: [
                { message: 'Resolve', iconName: 'CheckMark', actions: [() => update(record, { status: RESOLVED })] },
                { message: 'Take it back', iconName: 'Undo', actions: [() => update(record, { escalated: false })] },
            ],
        })
    }
    return notifications
}

const supportDeskScript: IGridModule = {
    name: 'supportDeskScript',
    onLoad: grid => {
        const tickets = grid.services.get('provider')
        const addRecommendations = (record: IRecord) => record.expressions.ui.setNotificationsExpression('title', () => getRecommendations(record))
        tickets.getRecords().forEach(addRecommendations)
        //a reload or a save clears a record's expressions
        const unsubscribe = tickets.addEventListener('onRecordLoaded', addRecommendations)
        //the provider outlives the grid
        grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
    },
}

const onSetup = (grid: IGrid) => {
    grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
        //room for the notifications beside the title
        columnDefs.find(colDef => colDef.colId === 'title')!.initialWidth = 380
    })
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid
            modules={[
                createLegacyClientApiCompatibilityModule(),
                supportDeskScript,
            ]}
            onSetup={onSetup}
            height='420px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const STOCK_SCRIPT_CODE = `const LOCKED_WHEN_DISCONTINUED = ['price', 'instock', 'reorderlevel', 'supplier']

let isSyncingStock = false

//two-options values read back as '1' or '0'
const isDiscontinued = (record: IRecord) => record.getValue('discontinued') === '1'

//the grid picks a readable text colour for a background
const getStockFormatting = (record: IRecord) => {
    const inStock = Number(record.getValue('instock') ?? 0)
    if (inStock === 0) {
        return { backgroundColor: '#d13438' }
    }
    if (inStock <= Number(record.getValue('reorderlevel') ?? 0)) {
        return { backgroundColor: '#ffb900' }
    }
    return undefined
}

const addStockScript = (record: IRecord) => {
    record.expressions.ui.setCustomFormattingExpression('instock', () => getStockFormatting(record))
    record.expressions.ui.setLoadingExpression('instock', () => isSyncingStock)
    LOCKED_WHEN_DISCONTINUED.forEach(columnName => record.expressions.setDisabledExpression(columnName, () => isDiscontinued(record)))
}

const stockScript: IGridModule = {
    name: 'stockScript',
    onLoad: grid => {
        const products = grid.services.get('provider')
        products.getRecords().forEach(addStockScript)
        const unsubscribe = products.addEventListener('onRecordLoaded', addStockScript)
        grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
    },
}

const waitForWarehouse = () => new Promise(resolve => setTimeout(resolve, 1500))

//a cell redraws by itself only when its own record changes
const syncStock = async () => {
    isSyncingStock = true
    provider.requestRender()
    await waitForWarehouse()
    isSyncingStock = false
    provider.requestRender()
}

const GridExample = () => {
    //the ribbon disables a command while it runs
    const loadCommands = async (): Promise<IRibbonCommand[]> => [{ id: 'sync', label: 'Sync stock', iconName: 'Sync', onExecute: syncStock }]

    return <DatasetControl onLoad={async () => ({ provider: provider })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <ClientSideGrid
                modules={[
                    createEditingModule({ enableAutoSave: true }),
                    createLegacyClientApiCompatibilityModule(),
                    stockScript,
                ]}
                height='420px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const EMPTY_VALUE_PLACEHOLDERS_CODE = `const NEW = 1

const addAssigneePlaceholder = (record: IRecord) => record.expressions.ui.setControlParametersExpression('assignee', parameters => ({
    ...parameters,
    Placeholder: { raw: Number(record.getValue('status')) === NEW ? 'Waiting for triage' : 'Unassigned' },
}))

const triageScript: IGridModule = {
    name: 'triageScript',
    onLoad: grid => {
        const tickets = grid.services.get('provider')
        tickets.getRecords().forEach(addAssigneePlaceholder)
        const unsubscribe = tickets.addEventListener('onRecordLoaded', addAssigneePlaceholder)
        grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
    },
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid
            modules={[
                createEditingModule({ enableAutoSave: true }),
                createLegacyClientApiCompatibilityModule(),
                triageScript,
            ]}
            height='400px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const TicketRecommendationsExample = () => <GridExampleRunner seedCode={TICKET_RECOMMENDATIONS_CODE} dataset='tickets' />

export const StockScriptExample = () => <GridExampleRunner seedCode={STOCK_SCRIPT_CODE} dataset='products' />

export const EmptyValuePlaceholdersExample = () => <GridExampleRunner seedCode={EMPTY_VALUE_PLACEHOLDERS_CODE} dataset='tickets' />
