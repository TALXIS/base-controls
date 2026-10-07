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
                { message: 'Extend to tomorrow', iconName: 'Calendar', actions: [() => update(record, { duedate: dayjs().add(1, 'day').toISOString() })] },
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
    onRegister: runtime => {
        const addRecommendations = (record: IRecord) => record.expressions.ui.setNotificationsExpression('title', () => getRecommendations(record))
        provider.getRecords().forEach(addRecommendations)
        //a reload or a save clears a record's expressions
        provider.addEventListener('onRecordLoaded', addRecommendations)
        //the provider outlives the grid
        runtime.events.addEventListener('onDestroyed', () => provider.removeEventListener('onRecordLoaded', addRecommendations))
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
        custom: [supportDeskScript],
    }}
    colDefs={{ title: { initialWidth: 380 } }}
    enableOptionSetColors
    height='420px' />
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
    onRegister: runtime => {
        provider.getRecords().forEach(addStockScript)
        provider.addEventListener('onRecordLoaded', addStockScript)
        runtime.events.addEventListener('onDestroyed', () => provider.removeEventListener('onRecordLoaded', addStockScript))
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
    const [isSyncing, setIsSyncing] = React.useState(false)

    const onSync = async () => {
        setIsSyncing(true)
        await syncStock()
        setIsSyncing(false)
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={[{ key: 'sync', text: 'Sync stock', iconProps: { iconName: 'Sync' }, disabled: isSyncing, onClick: () => { onSync() } }]} />
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                editing: createEditingModule({ autoSave: true }),
                legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
                custom: [stockScript],
            }}
            colDefs={{ discontinued: { context: { cell: { oneClickEdit: true } } } }}
            height='420px' />
    </Stack>
}
`

export const EMPTY_VALUE_PLACEHOLDERS_CODE = `const NEW = 1

const addAssigneePlaceholder = (record: IRecord) => record.expressions.ui.setControlParametersExpression('assignee', parameters => ({
    ...parameters,
    Placeholder: { raw: Number(record.getValue('status')) === NEW ? 'Waiting for triage' : 'Unassigned' },
}))

const triageScript: IGridModule = {
    onRegister: runtime => {
        provider.getRecords().forEach(addAssigneePlaceholder)
        provider.addEventListener('onRecordLoaded', addAssigneePlaceholder)
        runtime.events.addEventListener('onDestroyed', () => provider.removeEventListener('onRecordLoaded', addAssigneePlaceholder))
    },
}

const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        editing: createEditingModule({ autoSave: true }),
        legacyClientApiCompatibility: createLegacyClientApiCompatibilityModule(),
        custom: [triageScript],
    }}
    enableOptionSetColors
    height='400px' />
`

export const TicketRecommendationsExample = () => <GridExampleRunner seedCode={TICKET_RECOMMENDATIONS_CODE} dataset='tickets' />

export const StockScriptExample = () => <GridExampleRunner seedCode={STOCK_SCRIPT_CODE} dataset='products' />

export const EmptyValuePlaceholdersExample = () => <GridExampleRunner seedCode={EMPTY_VALUE_PLACEHOLDERS_CODE} dataset='tickets' />
