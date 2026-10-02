import React from 'react'
import dayjs from 'dayjs'
import type { MemoryDataProvider } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDealsProvider, DEAL_COLUMNS, DEAL_DETAIL_COLUMNS, DEAL_ROWS } from '../data'
import { FeatureSwitcher, IShowcaseFeatureGroup, IShowcaseFeatureValues, IShowcasePreset } from '../showcase/FeatureSwitcher'

export const SHOWCASE_CODE = `const WON = 4
const LOST = 5

const isSummaryRow = (record: IRecord) => record.getDataProvider().getSummarizationType() !== 'none'
const isClosed = (record: IRecord) => [WON, LOST].includes(Number(record.getValue('stage')))
const formatMoney = (amount: number) => '$' + amount.toLocaleString('en-US')

const isOverdue = (record: IRecord) => {
    const closeDate = record.getValue('closedate')
    return !isSummaryRow(record) && !isClosed(record) && !!closeDate && dayjs(closeDate).isBefore(dayjs(), 'day')
}

const saveValue = async (record: IRecord, columnName: string, value: unknown) => {
    record.setValue(columnName, value)
    const result = await record.save()
    if (!result.success) {
        record.clearChanges()
    }
}

//while grouped, a deal is held by the provider of its group
const findDeal = (recordId: string) => [provider, ...provider.getGroupedRecordDataProviders(true)].map(source => source.getRecordsMap()[recordId]).find(Boolean)

const lockClosedDeals = (result: IGridLock, { record }: { record: IRecord }) => {
    if (!isSummaryRow(record) && isClosed(record)) {
        result.isLocked = true
    }
}

const closedDealColoursModule: IGridModule = {
    onRegister: runtime => {
        //grouping repaints every record row while the deals are grouped
        runtime.services.get('cells').registerCellThemeHook((theme, { record }) => {
            if (isSummaryRow(record) || !isClosed(record)) {
                return
            }
            const isWon = Number(record.getValue('stage')) === WON
            theme.colors.background = isWon ? '#dff6dd' : '#fde7e9'
            theme.colors.text = isWon ? '#0b6a0b' : '#a4262c'
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

//the notifications a client script would set on a deal
const getRecommendations = (record: IRecord): IAddControlNotificationOptions[] => {
    if (isSummaryRow(record) || isClosed(record)) {
        return []
    }
    const notifications: IAddControlNotificationOptions[] = []
    const moveCloseDate = (days: number) => () => saveValue(record, 'closedate', dayjs().add(days, 'day').format('YYYY-MM-DD'))
    if (isOverdue(record)) {
        notifications.push({
            uniqueId: 'overdue',
            notificationLevel: 'RECOMMENDATION',
            iconName: 'Clock',
            text: 'Overdue',
            messages: ['The close date has passed. Move it out, or close the deal.'],
            actions: [
                { message: 'A week out', iconName: 'Calendar', actions: [moveCloseDate(7)] },
                { message: 'A month out', iconName: 'Calendar', actions: [moveCloseDate(30)] },
                { message: 'Mark as won', iconName: 'Trophy2', actions: [() => saveValue(record, 'stage', WON)] },
                { message: 'Mark as lost', iconName: 'Cancel', actions: [() => saveValue(record, 'stage', LOST)] },
            ],
        })
    }
    if (Number(record.getValue('value') ?? 0) > 30000) {
        notifications.push({
            uniqueId: 'signOff',
            notificationLevel: 'RECOMMENDATION',
            iconName: 'Shield',
            text: 'Needs sign-off',
            messages: ['A deal over $30,000 needs a manager to sign it off before it can be saved.'],
        })
    }
    return notifications
}

const recommendationsModule: IGridModule = {
    onRegister: runtime => {
        const addRecommendations = (record: IRecord) => record.expressions.ui.setNotificationsExpression('name', () => getRecommendations(record))
        provider.getRecords().forEach(addRecommendations)
        provider.addEventListener('onRecordLoaded', addRecommendations)
        //the provider outlives the grid
        runtime.events.addEventListener('onDestroyed', () => provider.removeEventListener('onRecordLoaded', addRecommendations))
    },
}

const validateDiscount = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    if (Number(record.getValue('discount') ?? 0) > 20) {
        result.error = true
        result.errorMessage = 'A discount over 20 % needs a manager.'
    }
}

interface IShowcaseProps {
    features: { [feature: string]: boolean }
}

const GridExample = (props: IShowcaseProps) => {
    const { features } = props
    const [selection, setSelection] = React.useState<string[]>([])
    const [lastSave, setLastSave] = React.useState<IRecordSaveOperationResult>()
    const selectedIds = features.rowSelection ? selection : []
    const selectedValue = selectedIds.reduce((total, recordId) => total + Number(findDeal(recordId)?.getValue('value') ?? 0), 0)

    //a command on a selected deal closes every selected deal
    const closeDeals = (record: IRecord, stage: number) => {
        const selected = features.rowSelection ? provider.getSelectedRecordIds() : []
        const targets = selected.includes(record.getRecordId()) ? selected.map(findDeal) : [record]
        for (const target of targets) {
            if (target && !isClosed(target)) {
                saveValue(target, 'stage', stage)
            }
        }
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        {selectedIds.length > 0 && <MessageBar>{selectedIds.length} selected, worth {formatMoney(selectedValue)}.</MessageBar>}
        {lastSave && <MessageBar messageBarType={lastSave.success ? MessageBarType.success : MessageBarType.warning} onDismiss={() => setLastSave(undefined)}>
            {lastSave.success ? 'Saved.' : 'Not saved. ' + (lastSave.errors ?? []).map(error => error.message).join(' ')}
        </MessageBar>}
        <Grid.Root
            key={JSON.stringify(features)}
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                rowSelection: features.rowSelection ? createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelection }) : undefined,
                cellSelection: features.cellSelection ? createCellSelectionModule() : undefined,
                clipboard: features.clipboard ? createClipboardModule() : undefined,
                sorting: features.sorting ? createSortingModule() : undefined,
                filtering: features.filtering ? createFilteringModule() : undefined,
                grouping: features.grouping ? createGroupingModule() : undefined,
                aggregation: features.aggregation ? createAggregationModule() : undefined,
                legacyClientApiCompatibility: features.recommendations ? createLegacyClientApiCompatibilityModule() : undefined,
                custom: features.recommendations ? [closedDealColoursModule, recommendationsModule] : [closedDealColoursModule],
            }}
            colDefs={{
                name: { pinned: 'left' },
                discount: { settings: { cell: { onGetValidation: validateDiscount } } },
                closedate: {
                    settings: {
                        cell: {
                            onGetTheme: (theme, { record }) => {
                                if (isOverdue(record)) {
                                    theme.colors.text = '#a4262c'
                                }
                            },
                        },
                    },
                },
                recurring: { settings: { cell: { oneClickEdit: features.editing } } },
                actions: {
                    headerName: '',
                    pinned: 'right',
                    initialWidth: 96,
                    settings: {
                        cell: {
                            onGetCommands: (result, { record }) => {
                                if (isSummaryRow(record) || isClosed(record)) {
                                    return
                                }
                                result.items.push({ key: 'won', title: 'Mark as won', iconProps: { iconName: 'Trophy2' }, onClick: () => closeDeals(record, WON) })
                                result.items.push({ key: 'lost', title: 'Mark as lost', iconProps: { iconName: 'Cancel' }, onClick: () => closeDeals(record, LOST) })
                            },
                        },
                    },
                },
            }}
            enableEditing={features.editing}
            enableAutoSave={features.autoSave}
            enableOptionSetColors={features.optionSetColors}
            enableZebra={features.zebra}
            rowSettings={{ onGetLock: lockClosedDeals }}
            onAfterRecordSaved={setLastSave}
            height='520px' />
    </Stack>
}
`

const HIDDEN_COLUMNS = ['probability', 'language', 'timezone', 'logo']
const NEGOTIATE = 3

const setGroupedByStage = (provider: MemoryDataProvider, isGrouped: boolean) => {
    //clear() would leave an ungrouped column read-only
    provider.grouping.getGroupBys().forEach(groupBy => provider.grouping.removeGroupBy(groupBy.alias))
    if (isGrouped) {
        provider.grouping.addGroupBy({ alias: 'stage_group', columnName: 'stage' })
    }
}

const createShowcaseProvider = (isGrouped: boolean) => {
    const provider = createDealsProvider()
    //open deals due around the day the page is read
    provider.setDataSource(DEAL_ROWS.map((row, index) => ({ ...row, stage: Math.min(row.stage, NEGOTIATE), closedate: row.closedate && dayjs().add(index * 4 - 30, 'day').format('YYYY-MM-DD') })))
    provider.setColumns([...DEAL_COLUMNS, ...DEAL_DETAIL_COLUMNS].filter(column => !HIDDEN_COLUMNS.includes(column.name)))
    provider.aggregation.addAggregation({ alias: 'value_sum', columnName: 'value', aggregationFunction: 'sum' })
    provider.aggregation.addAggregation({ alias: 'timespent_sum', columnName: 'timespent', aggregationFunction: 'sum' })
    //stands in for a server that refuses big deals without a sign-off
    provider.setInterceptor('onRecordSave', async (record, defaultAction) => {
        if (Number(record.getValue('value') ?? 0) <= 30000) {
            return defaultAction(record)
        }
        return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'value', message: 'A deal over $30,000 needs a manager to sign it off.' }] }
    })
    setGroupedByStage(provider, isGrouped)
    provider.refresh()
    return provider
}

const FEATURE_GROUPS: IShowcaseFeatureGroup[] = [
    {
        title: 'Editing',
        features: [
            { key: 'editing', label: 'Editing', hint: 'Double-click a Value or a Close date to change it, or flip Recurring right in its cell. A Discount over 20 % turns its cell red. Without Auto-save, changes are kept but not saved.' },
            { key: 'autoSave', label: 'Auto-save', hint: 'Turn on Editing too, then change a value: the row saves as soon as the cell takes it. The server refuses deals over $30,000, and the red icon at the start of the row says why.' },
        ],
    },
    {
        title: 'Selection',
        features: [
            { key: 'rowSelection', label: 'Rows', hint: 'Tick a few deals, then hover one of them and pick Mark as won in the last column: every selected deal is closed, except those the server refuses.' },
            { key: 'cellSelection', isEnterprise: true, label: 'Cell ranges', hint: 'Drag across a block of cells to highlight it, as in a spreadsheet.' },
            { key: 'clipboard', isEnterprise: true, label: 'Copy', hint: 'Press Ctrl+C on a cell, or on a highlighted range with Cell ranges on, and paste it into a spreadsheet.' },
        ],
    },
    {
        title: 'Shaping the data',
        features: [
            { key: 'sorting', label: 'Sorting', hint: "Click a column's header to open its menu, and sort by it." },
            { key: 'filtering', label: 'Filtering', hint: 'Open the Stage menu, pick Filter By and keep only the deals in negotiation.' },
            { key: 'grouping', isEnterprise: true, label: 'Grouping', hint: 'Deals are grouped by Stage. Open the Account manager menu and pick Group to group by it too.' },
            { key: 'aggregation', label: 'Totals', hint: "Value and Time spent are totalled under the rows, and in every group row. Pick another total from a number column's menu." },
        ],
    },
    {
        title: 'Look',
        features: [
            { key: 'optionSetColors', label: 'Option set colours', hint: 'Stage and Products are drawn as tags in their own colours, and so is Recurring while Editing is off.' },
            { key: 'zebra', label: 'Zebra rows', hint: 'Every other row is shaded, except while the deals are grouped.' },
        ],
    },
    {
        title: 'Model-driven apps',
        features: [
            { key: 'recommendations', label: 'Client script notifications', hint: 'Overdue deals and deals over $30,000 carry notifications a client script set. Hover one and open them in its Deal cell.' },
        ],
    },
]

const FEATURE_KEYS = FEATURE_GROUPS.flatMap(group => group.features.map(feature => feature.key))

const PRESETS: IShowcasePreset[] = [
    { key: 'list', label: 'Read-only list', iconName: 'BulletedList', description: 'A list to browse: sort and filter it, with option sets in colour.', features: ['sorting', 'filtering', 'optionSetColors', 'zebra'] },
    { key: 'sheet', label: 'Spreadsheet', iconName: 'Table', description: 'Edit in place with auto-save, highlight ranges and copy them out.', features: ['editing', 'autoSave', 'cellSelection', 'clipboard', 'sorting'] },
    { key: 'review', label: 'Pipeline review', iconName: 'Financial', description: 'Group by stage with totals, select deals and close them in bulk.', features: ['rowSelection', 'sorting', 'filtering', 'grouping', 'aggregation', 'optionSetColors', 'recommendations'] },
    { key: 'everything', label: 'Everything', iconName: 'Waffle', description: 'Every feature at once. Edit, select, group, total and copy.', features: FEATURE_KEYS },
]

const IDLE_HINT = 'Pick a preset or switch features on one by one. Hover a feature to see what it adds.'

export const ShowcaseExample = () => {
    const [features, setFeatures] = React.useState<IShowcaseFeatureValues>(Object.fromEntries(PRESETS[0].features.map(key => [key, true])))
    const provider = React.useRef<MemoryDataProvider>()

    const createProvider = () => {
        provider.current = createShowcaseProvider(!!features.grouping)
        return provider.current
    }

    const onChange = (next: IShowcaseFeatureValues) => {
        if (provider.current && !!next.grouping !== !!features.grouping) {
            setGroupedByStage(provider.current, !!next.grouping)
            provider.current.refresh()
        }
        setFeatures(next)
    }

    return <GridExampleRunner
        seedCode={SHOWCASE_CODE}
        onCreateProvider={createProvider}
        previewProps={{ features }}
        renderAbovePreview={() => <FeatureSwitcher groups={FEATURE_GROUPS} presets={PRESETS} values={features} onChange={onChange} idleHint={IDLE_HINT} />} />
}
