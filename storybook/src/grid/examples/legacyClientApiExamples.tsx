import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { DEAL_LIST_TABS, withDealGrid } from '../guide/dealGridFiles'

const RECOMMEND_NEXT_STEPS_CODE = `import { ClientSideGrid, createLegacyClientApiCompatibilityModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IAddControlNotificationOptions, IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'

const WON = 4
const LOST = 5

const isOpen = (deal: IRecord) => ![WON, LOST].includes(Number(deal.getValue('stage')))
const isOverdue = (deal: IRecord) => isOpen(deal) && dayjs(deal.getValue('closedate')).isBefore(dayjs(), 'day')

//sets the values and saves the deal
const update = (deal: IRecord, values: { [columnName: string]: unknown }) => {
    Object.entries(values).forEach(([columnName, value]) => deal.setValue(columnName, value))
    deal.save()
}

const getRecommendations = (deal: IRecord): IAddControlNotificationOptions[] => {
    const notifications: IAddControlNotificationOptions[] = []
    if (isOverdue(deal)) {
        //two actions open a callout on a click
        notifications.push({
            uniqueId: 'overdue',
            iconName: 'Clock',
            text: 'Overdue',
            messages: ['This deal was due to close on ' + deal.getFormattedValue('closedate') + '.'],
            buttonProps: { iconOnly: true },
            actions: [
                { message: 'Push a week', iconName: 'Forward', actions: [() => update(deal, { closedate: dayjs(deal.getValue('closedate')).add(7, 'day').toDate() })] },
                { message: 'Mark as lost', iconName: 'Cancel', actions: [() => update(deal, { stage: LOST })] },
            ],
        })
    }
    if (isOpen(deal) && deal.getValue('nextstep') === 'Send the proposal') {
        //one action runs at once on a click
        notifications.push({
            uniqueId: 'sendProposal',
            iconName: 'Send',
            text: 'Send the proposal',
            messages: [],
            buttonProps: { iconOnly: true },
            actions: [{ actions: [() => update(deal, { nextstep: 'Follow up on the proposal' })] }],
        })
    }
    return notifications
}

const runDealScript = (grid: IGrid) => {
    const provider = grid.services.get('provider')
    const addRecommendations = (deal: IRecord) => deal.expressions.ui.setNotificationsExpression('nextstep', () => getRecommendations(deal))
    provider.getRecords().forEach(addRecommendations)
    //a reload or a save clears a record's expressions
    const unsubscribe = provider.addEventListener('onRecordLoaded', addRecommendations)
    //the provider outlives the grid
    grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createLegacyClientApiCompatibilityModule()]} onSetup={runDealScript} />
    </DatasetControl.Body>
</DatasetControl>
`

const COLOUR_LOCK_AND_LOAD_CODE = `import { ClientSideGrid, createEditingModule, createLegacyClientApiCompatibilityModule, DatasetControl, IGrid, IRibbonCommand, useDataProvider } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'

const WON = 4
const LOST = 5
//the columns a won or lost deal locks
const LOCKED_WHEN_CLOSED = ['value', 'discount', 'probability', 'closedate']

let isSyncing = false

const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

//the grid picks a readable text colour for each background
const getProbabilityColours = (deal: IRecord) => {
    const probability = Number(deal.getValue('probability'))
    if (probability >= 70) {
        return { backgroundColor: '#107c10' }
    }
    return probability < 30 ? { backgroundColor: '#d13438' } : undefined
}

const addDealScript = (deal: IRecord) => {
    deal.expressions.ui.setCustomFormattingExpression('probability', () => getProbabilityColours(deal))
    deal.expressions.ui.setLoadingExpression('probability', () => isSyncing)
    LOCKED_WHEN_CLOSED.forEach(columnName => deal.expressions.setDisabledExpression(columnName, () => isClosed(deal)))
}

const runDealScript = (grid: IGrid) => {
    const provider = grid.services.get('provider')
    provider.getRecords().forEach(addDealScript)
    //a reload or a save clears a record's expressions
    const unsubscribe = provider.addEventListener('onRecordLoaded', addDealScript)
    grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
}

//drawn inside the DatasetControl to reach its provider
const SyncRibbon = () => {
    const provider = useDataProvider()
    const syncFromCrm = async () => {
        isSyncing = true
        //a cell redraws by itself only when its own record changes
        provider.requestRender()
        await new Promise(resolve => setTimeout(resolve, 1500))
        isSyncing = false
        provider.requestRender()
    }
    const loadCommands = async (): Promise<IRibbonCommand[]> => [{ id: 'sync', label: 'Sync from the CRM', iconName: 'Sync', onExecute: syncFromCrm }]
    return <DatasetControl.Ribbon onLoad={loadCommands} />
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <SyncRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule({ enableAutoSave: true }), createLegacyClientApiCompatibilityModule()]} onSetup={runDealScript} />
    </DatasetControl.Body>
</DatasetControl>
`

const SAY_WHY_A_VALUE_IS_EMPTY_CODE = `import { ClientSideGrid, createEditingModule, createLegacyClientApiCompatibilityModule, DatasetControl, IGrid } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { loadDeals } from './deals'

const QUALIFY = 1

const addCloseDatePlaceholder = (deal: IRecord) => deal.expressions.ui.setControlParametersExpression('closedate', parameters => ({
    ...parameters,
    Placeholder: { raw: Number(deal.getValue('stage')) === QUALIFY ? 'Set once qualified' : 'Not set' },
}))

const runDealScript = (grid: IGrid) => {
    const provider = grid.services.get('provider')
    provider.getRecords().forEach(addCloseDatePlaceholder)
    //a reload or a save clears a record's expressions
    const unsubscribe = provider.addEventListener('onRecordLoaded', addCloseDatePlaceholder)
    grid.lifecycle.events.addEventListener('onDestroyed', unsubscribe)
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule(), createLegacyClientApiCompatibilityModule()]} onSetup={runDealScript} />
    </DatasetControl.Body>
</DatasetControl>
`

export const RecommendNextStepsExample = () => <GridExampleRunner seedCode={withDealGrid(RECOMMEND_NEXT_STEPS_CODE)} tabs={DEAL_LIST_TABS} />

export const ColourLockAndLoadExample = () => <GridExampleRunner seedCode={withDealGrid(COLOUR_LOCK_AND_LOAD_CODE)} tabs={DEAL_LIST_TABS} />

export const SayWhyAValueIsEmptyExample = () => <GridExampleRunner seedCode={withDealGrid(SAY_WHY_A_VALUE_IS_EMPTY_CODE)} tabs={DEAL_LIST_TABS} />
