import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'
import { FeatureSwitcher, getPresetValues, IShowcaseFeatureGroup, IShowcaseFeatureValues, IShowcasePreset } from '../showcase/FeatureSwitcher'

const GRID_EXAMPLE = `import { createDealsProvider } from './deals'
import { FeatureFrame, IFeatureSwitches, useFeatures } from './features'

interface IGridExampleProps {
    /** What the Features panel and its presets have switched on. */
    features: IFeatureSwitches
}

export const GridExample = (props: IGridExampleProps) => {
    const deals = React.useMemo(createDealsProvider, [])
    const { modules, frame, ...featureProps } = useFeatures(deals, props.features)

    return <FeatureFrame {...frame}>
        <Grid.Root
            //modules are read once, at mount
            key={JSON.stringify(props.features)}
            provider={deals}
            modules={{ rowModel: createClientSideRowModelModule(), ...modules }}
            {...featureProps}
            height='520px' />
    </FeatureFrame>
}
`

const DEALS = `export const WON = 4
export const LOST = 5

const STAGES = [
    { Value: 1, Label: 'Qualify', Color: '#605e5c' },
    { Value: 2, Label: 'Propose', Color: '#0078d4' },
    { Value: 3, Label: 'Negotiate', Color: '#c19c00' },
    { Value: WON, Label: 'Won', Color: '#107c10' },
    { Value: LOST, Label: 'Lost', Color: '#a4262c' },
]

const PRODUCTS = [
    { Value: 10, Label: 'CRM', Color: '#038387' },
    { Value: 20, Label: 'Support', Color: '#8764b8' },
    { Value: 30, Label: 'Analytics', Color: '#c239b3' },
    { Value: 40, Label: 'Training', Color: '#ca5010' },
]

//without colours, so Recurring reads as plain text
const YES_NO = [
    { Value: 0, Label: 'No', Color: '' },
    { Value: 1, Label: 'Yes', Color: '' },
]

const TOTALS: IAttributeMetadata = { SupportedAggregations: ['sum', 'avg', 'min', 'max'] }

//filtering, grouping and editing are each switched on by the column's metadata
const createColumn = (name: string, displayName: string, dataType: DataType, width: number, metadata: IAttributeMetadata = {}): IColumn => ({
    name,
    displayName,
    dataType,
    visualSizeFactor: width,
    metadata: {
        IsValidForUpdate: true,
        CanBeGrouped: true,
        SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(dataType).map(operator => operator.Value),
        ...metadata,
    },
})

const COLUMNS: IColumn[] = [
    { ...createColumn('name', 'Deal', DataTypes.SingleLineText, 230), isPrimary: true },
    createColumn('owner', 'Account manager', DataTypes.SingleLineText, 160),
    createColumn('stage', 'Stage', DataTypes.OptionSet, 130, { OptionSet: STAGES }),
    createColumn('products', 'Products', DataTypes.MultiSelectOptionSet, 200, { OptionSet: PRODUCTS }),
    createColumn('value', 'Value', DataTypes.Currency, 130, TOTALS),
    createColumn('discount', 'Discount (%)', DataTypes.Decimal, 120, { ...TOTALS, Precision: 1 }),
    createColumn('closedate', 'Close date', DataTypes.DateAndTimeDateOnly, 360),
    createColumn('timespent', 'Time spent', DataTypes.WholeDuration, 120, TOTALS),
    createColumn('recurring', 'Recurring', DataTypes.TwoOptions, 100, { OptionSet: YES_NO }),
    createColumn('nextstep', 'Next step', DataTypes.SingleLineTextArea, 170),
]

//close dates fall around the day the page is read
const inDays = (days: number) => dayjs().add(days, 'day').format('YYYY-MM-DD')

//a duration is held in minutes
const ROWS: IRawRecord[] = [
    { dealid: '1', name: 'Contoso: CRM rollout', owner: 'Anna Novak', stage: 1, products: [10], value: 4000, discount: 0, closedate: inDays(-26), timespent: 30, recurring: false, nextstep: 'Send the proposal' },
    { dealid: '2', name: 'Fabrikam: Support renewal', owner: 'Ben Carter', stage: 2, products: [10, 20], value: 21500, discount: 2.5, closedate: inDays(-18), timespent: 90, recurring: true, nextstep: 'Book a demo' },
    { dealid: '3', name: 'Northwind: Data migration', owner: 'Chloé Martin', stage: 3, products: [30], value: 9000, discount: 5, closedate: inDays(-9), timespent: 240, recurring: true, nextstep: 'Chase the signature' },
    { dealid: '4', name: 'Adventure Works: Licence upgrade', owner: 'David Kim', stage: 1, products: [20, 40], value: 26500, discount: 7.5, closedate: inDays(-3), timespent: 480, recurring: false, nextstep: 'Agree the scope' },
    { dealid: '5', name: 'Litware: Onboarding package', owner: 'Anna Novak', stage: 2, products: [10, 30, 40], value: 14000, discount: 10, closedate: inDays(2), timespent: 960, recurring: true, nextstep: 'Review the contract' },
    { dealid: '6', name: 'Tailspin Toys: CRM rollout', owner: 'Ben Carter', stage: 3, products: [10], value: 32500, discount: 0, closedate: inDays(6), timespent: 1440, recurring: true, nextstep: 'Send the proposal' },
    { dealid: '7', name: 'Woodgrove Bank: Support renewal', owner: 'Chloé Martin', stage: 1, products: [10, 20], value: 6500, discount: 2.5, closedate: inDays(10), timespent: 2880, recurring: false, nextstep: 'Book a demo' },
    { dealid: '8', name: 'Proseware: Data migration', owner: 'David Kim', stage: 2, products: [30], value: 19000, discount: 5, closedate: inDays(14), timespent: 30, recurring: true, nextstep: 'Chase the signature' },
    { dealid: '9', name: 'Alpine Ski House: Licence upgrade', owner: 'Anna Novak', stage: 3, products: [20, 40], value: 11500, discount: 7.5, closedate: inDays(18), timespent: 90, recurring: true, nextstep: 'Agree the scope' },
    { dealid: '10', name: 'Wide World Importers: Onboarding package', owner: 'Ben Carter', stage: 1, products: [10, 30, 40], value: 29000, discount: 10, closedate: inDays(22), timespent: 240, recurring: false, nextstep: 'Review the contract' },
    { dealid: '11', name: 'Contoso: Support renewal', owner: 'Chloé Martin', stage: 2, products: [10, 20], value: 16500, discount: 0, closedate: inDays(26), timespent: 480, recurring: true, nextstep: 'Send the proposal' },
    { dealid: '12', name: 'Fabrikam: Data migration', owner: 'David Kim', stage: 3, products: [30], value: 34000, discount: 2.5, closedate: inDays(30), timespent: 960, recurring: true, nextstep: 'Book a demo' },
    { dealid: '13', name: 'Northwind: Licence upgrade', owner: 'Anna Novak', stage: 1, products: [20, 40], value: 24000, discount: 5, closedate: inDays(34), timespent: 1440, recurring: false, nextstep: 'Chase the signature' },
    { dealid: '14', name: 'Adventure Works: Onboarding package', owner: 'Ben Carter', stage: 2, products: [10, 30, 40], value: 4000, discount: 7.5, closedate: inDays(38), timespent: 2880, recurring: true, nextstep: 'Agree the scope' },
    { dealid: '15', name: 'Litware: CRM rollout', owner: 'Chloé Martin', stage: 3, products: [10], value: 21500, discount: 10, closedate: inDays(42), timespent: 30, recurring: true, nextstep: 'Review the contract' },
    { dealid: '16', name: 'Tailspin Toys: Support renewal', owner: 'David Kim', stage: 1, products: [10, 20], value: 9000, discount: 0, closedate: inDays(46), timespent: 90, recurring: false, nextstep: 'Send the proposal' },
]

/** Keeps the deals in memory, where a real app would save them to Dataverse or its own API. */
class DealsProvider extends MemoryDataProvider {
    //stands in for a server that refuses big deals without a sign-off
    public async onRecordSave(deal: IRecord): Promise<IRecordSaveOperationResult> {
        if (Number(deal.getValue('value') ?? 0) > 30000) {
            return { recordId: deal.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'value', message: 'A deal over $30,000 needs a manager to sign it off.' }] }
        }
        return super.onRecordSave(deal)
    }
}

export const createDealsProvider = () => new DealsProvider({
    dataSource: ROWS,
    metadata: { PrimaryIdAttribute: 'dealid', PrimaryNameAttribute: 'name', LogicalName: 'deal' },
    columns: COLUMNS,
})

//a group or a total row stands for many deals
export const isSummaryRow = (record: IRecord) => record.getDataProvider().getSummarizationType() !== 'none'

export const isClosed = (deal: IRecord) => [WON, LOST].includes(Number(deal.getValue('stage')))

/** Whether a close date has passed, or falls within the next seven days. */
export const getCloseDateState = (closeDate: Date | null | undefined) => {
    if (!closeDate) {
        return undefined
    }
    const days = dayjs(closeDate).startOf('day').diff(dayjs().startOf('day'), 'day')
    return days < 0 ? 'overdue' : days <= 7 ? 'dueThisWeek' : undefined
}

export const isOverdue = (deal: IRecord) => !isSummaryRow(deal) && !isClosed(deal) && getCloseDateState(deal.getValue('closedate')) === 'overdue'

const LARGEST_VALUE = Math.max(...ROWS.map(row => Number(row.value)))

/** How big a value is next to the largest deal, from 0 to 1. */
export const getValueShare = (value: number) => value / LARGEST_VALUE

//while grouped, a deal is held by the provider of its group
export const findDeal = (deals: IDataProvider, recordId: string) => [deals, ...deals.getGroupedRecordDataProviders(true)].map(source => source.getRecordsMap()[recordId]).find(Boolean)
`

const AT_A_GLANCE = `import { getCloseDateState, getValueShare, isClosed, isOverdue, isSummaryRow, LOST, WON } from './deals'
import type { IFeature } from './features'

/** What a cell shows: a grouped column draws its value in the group's row rather than in the deal's. */
const getShownValue = (runtime: IGridRuntime, record: IRecord, columnName: string) => {
    const grouping = runtime.services.find('grouping')
    const column = runtime.services.get('provider').getColumnsMap()[columnName]
    if (column && grouping?.isColumnGrouped(column)) {
        return grouping.isRowGroupedBy(record, columnName) ? record.getValue(grouping.getGroupedValueColumnName(record, columnName)) : undefined
    }
    return isSummaryRow(record) ? undefined : record.getValue(columnName)
}

const CLOSE_DATE_ICONS = { overdue: 'Warning', dueThisWeek: 'Clock' }
const CLOSE_DATE_TINTS = { overdue: '#fde7e9', dueThisWeek: '#fff4ce' }

//light to deep green, by how big the deal is
const VALUE_TINTS = ['#f3faf3', '#dff6dd', '#bfe8bc']

/** An icon before overdue and due close dates. */
const statusIcons: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerControlParametersHook((parameters, { record, columnName }) => {
            const value = getShownValue(runtime, record, columnName)
            const state = columnName === 'closedate' && !isClosed(record) ? getCloseDateState(value) : undefined
            if (state) {
                parameters.PrefixIcon = { raw: CLOSE_DATE_ICONS[state] }
            }
        })
    },
}

/** Close dates tinted red when overdue and amber when due this week, and Value tinted by deal size. */
const colourRules: IGridModule = {
    onRegister: runtime => {
        //after grouping, which repaints every row while the deals are grouped
        runtime.services.get('cells').registerCellThemeHook((theme, { record, columnName }) => {
            const value = getShownValue(runtime, record, columnName)
            if (value == null || isClosed(record)) {
                return
            }
            const state = columnName === 'closedate' ? getCloseDateState(value) : undefined
            if (state) {
                theme.colors.background = CLOSE_DATE_TINTS[state]
            }
            if (columnName === 'value') {
                theme.colors.background = VALUE_TINTS[Math.min(Math.floor(getValueShare(Number(value)) * VALUE_TINTS.length), VALUE_TINTS.length - 1)]
            }
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

/** What the colours and icons in Close date mean. */
const headerExtras: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('columns').headers.registerColumnHeaderAdornmentsHook((adornments, header) => {
            const legend = LEGENDS[header.getColumn()?.name ?? '']
            if (legend) {
                adornments.push({ key: 'legend', placement: 'suffix', title: legend, onRender: () => <Icon iconName='Info' /> })
            }
        })
    },
}

const LEGENDS: { [columnName: string]: string } = {
    closedate: 'red when overdue, amber when due this week',
}

/** Commands in the close date of an overdue deal that push it back. */
const overdueActions: IGridModule = {
    onRegister: runtime => {
        //the field saves the deal while auto-save is on
        const pushBack = (deal: IRecord, days: number) => runtime.services.get('fields').get(deal, 'closedate').setValue(dayjs().add(days, 'day').startOf('day').toDate())
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'closedate' || !isOverdue(record) || getShownValue(runtime, record, columnName) == null) {
                return
            }
            result.items.push({ key: 'pushWeek', text: 'Push a week', iconProps: { iconName: 'Forward' }, onClick: () => { pushBack(record, 7) } })
            result.items.push({ key: 'pushMonth', text: 'Push a month', iconProps: { iconName: 'Calendar' }, onClick: () => { pushBack(record, 30) } })
        })
    },
}

type ICondition = ComponentFramework.PropertyHelper.DataSetApi.ConditionExpression

//the filter writes option set values as strings
const OPEN_DEALS: ICondition[] = [{ attributeName: 'stage', conditionOperator: Operators.NotIn.Value, value: [String(WON), String(LOST)] }]
const today = () => dayjs().format('YYYY-MM-DD')

const QUICK_VIEWS: { [columnName: string]: { key: string; text: string; iconName: string; conditions: ICondition[] }[] } = {
    closedate: [
        { key: 'overdue', text: 'Overdue', iconName: 'Warning', conditions: [...OPEN_DEALS, { attributeName: 'closedate', conditionOperator: Operators.OnOrBefore.Value, value: dayjs().subtract(1, 'day').format('YYYY-MM-DD') }] },
        { key: 'dueThisWeek', text: 'Due this week', iconName: 'Clock', conditions: [...OPEN_DEALS, { attributeName: 'closedate', conditionOperator: Operators.OnOrAfter.Value, value: today() }, { attributeName: 'closedate', conditionOperator: Operators.OnOrBefore.Value, value: dayjs().add(7, 'day').format('YYYY-MM-DD') }] },
    ],
    value: [
        { key: 'bigDeals', text: 'Deals over $25,000', iconName: 'Money', conditions: [{ attributeName: 'value', conditionOperator: Operators.GreaterThan.Value, value: '25000' }] },
    ],
}

/** A Quick views section in the menus of Close date and Value, each view a ready-made filter. */
const quickViews: IGridModule = {
    onRegister: runtime => {
        const deals = runtime.services.get('provider')
        const show = (conditions: ICondition[] | null) => {
            deals.setFiltering(conditions ? { filterOperator: Type.And.Value, conditions } : null)
            deals.refresh()
        }
        runtime.services.get('columns').headers.registerColumnMenuSectionHook((sections, header) => {
            const views = QUICK_VIEWS[header.getColumn()?.name ?? '']
            if (!views) {
                return
            }
            sections.push({
                key: 'quickViews',
                title: 'Quick views',
                items: [
                    ...views.map(view => ({ key: view.key, text: view.text, iconProps: { iconName: view.iconName }, onClick: () => show(view.conditions) })),
                    { key: 'showAll', text: 'Show all deals', iconProps: { iconName: 'ClearFilter' }, onClick: () => show(null) },
                ],
            })
        }, GRID_MODULE_PRIORITY.aggregation + 1)
    },
}

const FORM_SECTIONS = [
    { label: 'Deal', columnNames: ['name', 'owner', 'stage', 'products'] },
    { label: 'Money', columnNames: ['value', 'discount', 'recurring'] },
    { label: 'Timing', columnNames: ['closedate', 'timespent', 'nextstep'] },
]

//the form saves into the record the grid shows
const createDealStrategy = (deal: IRecord) => {
    const strategy = new MemoryStrategy({
        onGetColumns: () => deal.getDataProvider().getColumns(),
        onGetData: () => ({ ...deal.getRawData() }),
        onGetMetadata: () => ({ PrimaryIdAttribute: 'dealid', PrimaryNameAttribute: 'name' }),
    })
    strategy.onSave = async ({ updatedData }) => {
        Object.entries(updatedData).forEach(([columnName, value]) => deal.setValue(columnName, value))
        return deal.save()
    }
    return strategy
}

/** The deal in a form, saved from its ribbon. */
const DealForm = (props: { deal: IRecord }) => {
    const strategy = React.useMemo(() => createDealStrategy(props.deal), [props.deal])

    return <Form.Root strategy={strategy}>
        <Form.Ribbon />
        {FORM_SECTIONS.map(section => <Form.Section key={section.label} label={section.label} layout={{ lg: 2 }} cellLabelPosition='Top'>
            {section.columnNames.map(columnName => <Form.Field key={columnName} name={columnName}>
                <Form.Cell>
                    <Form.Control />
                </Form.Cell>
            </Form.Field>)}
        </Form.Section>)}
    </Form.Root>
}

const DealPanel = (props: { deal?: IRecord; onDismiss: () => void }) => <Panel isOpen={!!props.deal} type={PanelType.medium} headerText={props.deal?.getFormattedValue('name') ?? ''} isLightDismiss onDismiss={props.onDismiss}>
    {props.deal && <DealForm key={props.deal.getRecordId()} deal={props.deal} />}
</Panel>

/** An Open in a form command beside every deal's name. */
const openInForm: IGridModule = {
    onRegister: runtime => {
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'name' || isSummaryRow(record)) {
                return
            }
            result.items.push({ key: 'openInForm', title: 'Open in a form', iconProps: { iconName: 'OpenPane' }, onClick: () => runtime.openRecord({ record, reference: record.getNamedReference(), columnName }) })
        })
    },
}

export const AT_A_GLANCE: { [feature: string]: IFeature } = {
    statusIcons: () => ({ modules: { custom: [statusIcons] } }),
    colourRules: () => ({ modules: { custom: [colourRules] } }),
    headerExtras: () => ({ modules: { custom: [headerExtras] } }),
    overdueActions: () => ({ modules: { custom: [overdueActions] } }),
    quickViews: () => ({ modules: { custom: [quickViews] } }),
    //the command and the Deal link both open the deal through onOpenRecord
    dealForm: ({ openedDeal, onOpenDeal }) => ({
        modules: { custom: [openInForm] },
        onOpenRecord: ({ record }) => onOpenDeal(record),
        frame: { overlays: [<DealPanel key='dealPanel' deal={openedDeal} onDismiss={() => onOpenDeal(undefined)} />] },
    }),
}
`

const READ_ONLY_LIST = `import type { IFeature } from './features'

export const READ_ONLY_LIST: { [feature: string]: IFeature } = {
    sorting: () => ({ modules: { sorting: createSortingModule() } }),
    filtering: () => ({ modules: { filtering: createFilteringModule() } }),
    optionSetColors: () => ({ enableOptionSetColors: true }),
    zebra: () => ({ enableZebra: true }),
}
`

const SPREADSHEET = `import type { IFeature } from './features'

//a little roomier than Excel's 20 pixels
const COMPACT_ROW_HEIGHT = 28

const EXCEL_BASE_THEME = ThemeGenerator.generate({ primary: '#217346', background: '#ffffff', text: '#000000' })

//the grid draws its lines in the divider colour
const EXCEL_THEME = { ...EXCEL_BASE_THEME, semanticColors: { ...EXCEL_BASE_THEME.semanticColors, menuDivider: '#d4d4d4' } }

export const SPREADSHEET: { [feature: string]: IFeature } = {
    //Recurring flips right in its cell
    editing: ({ switches }) => ({
        modules: { editing: createEditingModule({ autoSave: !!switches.autoSave }) },
        colDefs: { recurring: { settings: { cell: { oneClickEdit: true } } } },
    }),
    //saving itself is the editing module's autoSave option, read above
    autoSave: ({ toasts }) => ({
        onAfterRecordSaved: result => {
            if (!result.success) {
                toasts.dispatchToast(<Toast>
                    <ToastTitle>Not saved</ToastTitle>
                    <ToastBody>{result.errors?.map(error => error.message).join(' ')}</ToastBody>
                </Toast>, { intent: 'error', timeout: 6000 })
            }
        },
    }),
    cellSelection: () => ({ modules: { cellSelection: createCellSelectionModule() } }),
    clipboard: () => ({ modules: { clipboard: createClipboardModule() } }),
    compactRows: () => ({ rowHeight: COMPACT_ROW_HEIGHT }),
    excelTheme: () => ({ frame: { theme: EXCEL_THEME } }),
}
`

const PIPELINE_REVIEW = `import { findDeal } from './deals'
import type { IFeature, IFeatureSwitches, IToasts } from './features'

export const PIPELINE_REVIEW: { [feature: string]: IFeature } = {
    rowSelection: ({ deals, switches, toasts, formatting }) => ({
        modules: { rowSelection: createRowSelectionModule({ mode: switches.rowSelection || 'multiple', onSelectionChanged: selectedIds => showSelectionTotal(deals, selectedIds, toasts, formatting) }) },
    }),
    grouping: () => ({ modules: { grouping: createGroupingModule() } }),
    aggregation: () => ({ modules: { aggregation: createAggregationModule() } }),
}

const STAGE_GROUP: IGroupByMetadata = { alias: 'stage_group', columnName: 'stage' }

const STAGE_TOTALS: IAggregationMetadata[] = [
    { alias: 'value_sum', columnName: 'value', aggregationFunction: 'sum' },
    { alias: 'timespent_sum', columnName: 'timespent', aggregationFunction: 'sum' },
]

/** Groups the deals by stage with totals for the Pipeline review preset, and clears what the user grouped or totalled when the features change. */
export const useStageGrouping = (deals: IDataProvider, switches: IFeatureSwitches) => {
    const isReviewed = !!switches.groupByStage
    React.useEffect(() => {
        const groupBys = deals.grouping.getGroupBys()
        const aggregations = deals.aggregation.getAggregations()
        if (!groupBys.length && !aggregations.length && !isReviewed) {
            return
        }
        //clear() would leave an ungrouped column read-only
        groupBys.forEach(groupBy => deals.grouping.removeGroupBy(groupBy.alias))
        aggregations.forEach(aggregation => deals.aggregation.removeAggregation(aggregation.alias))
        if (isReviewed) {
            deals.grouping.addGroupBy(STAGE_GROUP)
            STAGE_TOTALS.forEach(total => deals.aggregation.addAggregation(total))
        }
        deals.refresh()
    }, [switches.grouping, switches.aggregation, isReviewed])
}

const SELECTION_TOAST = 'selectionTotal'

//whether the total is on screen, to update it rather than raise it again
let isSelectionTotalShown = false

/** Adds up the value of the selected deals in a toast that stays while any are selected. */
const showSelectionTotal = (deals: IDataProvider, selectedIds: string[], toasts: IToasts, formatting: IFormatting) => {
    const selected = selectedIds.map(recordId => findDeal(deals, recordId)).filter(Boolean)
    if (!selected.length) {
        toasts.dismissToast(SELECTION_TOAST)
        return
    }
    const value = selected.reduce((total, deal) => total + Number(deal.getValue('value') ?? 0), 0)
    const content = <Toast>
        <ToastTitle>{selected.length} selected</ToastTitle>
        <ToastBody>Worth {formatting.formatCurrency(value)} together.</ToastBody>
    </Toast>
    if (isSelectionTotalShown) {
        toasts.updateToast({ toastId: SELECTION_TOAST, content })
        return
    }
    isSelectionTotalShown = true
    toasts.dispatchToast(content, {
        toastId: SELECTION_TOAST,
        intent: 'info',
        timeout: -1,
        onStatusChange: (_, data) => {
            if (data.status === 'unmounted') {
                isSelectionTotalShown = false
            }
        },
    })
}

/** Takes the selection total away when rows can no longer be selected. */
export const useSelectionTotal = (toasts: IToasts, isSelectable: boolean) => {
    React.useEffect(() => {
        if (!isSelectable) {
            toasts.dismissToast(SELECTION_TOAST)
        }
    }, [isSelectable])
}
`

const CLOSING_DEALS = `import { findDeal, isClosed, isSummaryRow, LOST, WON } from './deals'
import type { IFeature } from './features'

//the field saves the deal while auto-save is on
const closeDeal = async (runtime: IGridRuntime, deal: IRecord, stage: number) => {
    const result = await runtime.services.get('fields').get(deal, 'stage').setValue(stage)
    if (result && !result.success) {
        deal.clearChanges()
        return false
    }
    return true
}

//confetti bursts from the button that won the deal
const celebrate = (origin: { x: number; y: number }) => confetti({ particleCount: 150, spread: 80, origin })

/** Mark as won and Mark as lost in the actions column; on a selected deal they close every selected deal. */
const dealCommands: IGridModule = {
    onRegister: runtime => {
        const deals = runtime.services.get('provider')
        const closeDeals = async (deal: IRecord, stage: number, origin: { x: number; y: number }) => {
            const selectedIds = deals.getSelectedRecordIds()
            const targets = selectedIds.includes(deal.getRecordId()) ? selectedIds.map(recordId => findDeal(deals, recordId)) : [deal]
            const closed = await Promise.all(targets.filter(target => target && !isClosed(target)).map(target => closeDeal(runtime, target, stage)))
            if (stage === WON && closed.some(Boolean)) {
                celebrate(origin)
            }
        }
        //read during the click, since React reuses its events
        const getOrigin = (button?: HTMLElement) => {
            const rect = button?.getBoundingClientRect()
            return rect ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight } : { x: 0.5, y: 0.5 }
        }
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'actions' || isSummaryRow(record) || isClosed(record)) {
                return
            }
            result.items.push({ key: 'won', title: 'Mark as won', iconProps: { iconName: 'Trophy2' }, onClick: event => { closeDeals(record, WON, getOrigin(event?.currentTarget)) } })
            result.items.push({ key: 'lost', title: 'Mark as lost', iconProps: { iconName: 'Cancel' }, onClick: event => { closeDeals(record, LOST, getOrigin(event?.currentTarget)) } })
        })
    },
}

/** Paints won deals green and lost ones red. */
const closedDealColours: IGridModule = {
    onRegister: runtime => {
        //after grouping, which repaints every row while the deals are grouped
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

const lockClosedDeals = (result: IGridLock, { record }: { record: IRecord }) => {
    if (!isSummaryRow(record) && isClosed(record)) {
        result.isLocked = true
    }
}

export const CLOSING_DEALS: { [feature: string]: IFeature } = {
    rowActions: () => ({ modules: { custom: [dealCommands] }, colDefs: { actions: { headerName: '', pinned: 'right', initialWidth: 96 } } }),
    closedDealColours: () => ({ modules: { custom: [closedDealColours] } }),
    lockClosedDeals: () => ({ rowSettings: { onGetLock: lockClosedDeals } }),
}
`

const FEATURES = `import { AT_A_GLANCE } from './atAGlance'
import { CLOSING_DEALS } from './closingDeals'
import { PIPELINE_REVIEW, useSelectionTotal, useStageGrouping } from './pipelineReview'
import { READ_ONLY_LIST } from './readOnlyList'
import { SPREADSHEET } from './spreadsheet'

//turns the switches of the Features panel into grid props; a grid of your own sets them directly

/** What the Features panel has switched on, with the row selection mode when rows can be selected. */
export interface IFeatureSwitches {
    rowSelection?: 'single' | 'multiple' | false
    [feature: string]: boolean | string | undefined
}

/** What is drawn around the grid. */
interface IFeatureFrameProps {
    theme?: ITheme
    /** Drawn beside the grid, such as panels. */
    overlays?: JSX.Element[]
    children?: JSX.Element
}

export const TOASTER_ID = 'deals'

export type IToasts = ReturnType<typeof useToastController>

/** What a feature adds to the grid, and to what is drawn around it. */
export type IFeatureProps = Omit<Partial<IGrid>, 'modules'> & { modules?: Partial<IGridModules>; frame?: IFeatureFrameProps }

/** What the feature code shares. */
export interface IFeatureContext {
    deals: IDataProvider
    switches: IFeatureSwitches
    toasts: IToasts
    formatting: IFormatting
    /** The deal open in a form, if any. */
    openedDeal?: IRecord
    onOpenDeal: (deal?: IRecord) => void
}

export type IFeature = (context: IFeatureContext) => IFeatureProps

const FEATURES: { [feature: string]: IFeature } = { ...AT_A_GLANCE, ...READ_ONLY_LIST, ...SPREADSHEET, ...PIPELINE_REVIEW, ...CLOSING_DEALS }

//the deal's name stays in view while nothing is grouped, which the grid checks on every load
const getBaseProps = (deals: IDataProvider): IFeatureProps => ({
    colDefs: { name: () => deals.grouping.getGroupBys().length > 0 ? {} : { pinned: 'left' } },
})

//modules, columns, row settings and overlays add up across the features
const combine = (props: IFeatureProps, added: IFeatureProps): IFeatureProps => ({
    ...props,
    ...added,
    modules: { ...props.modules, ...added.modules, custom: [...props.modules?.custom ?? [], ...added.modules?.custom ?? []] },
    colDefs: { ...props.colDefs, ...added.colDefs },
    rowSettings: { ...props.rowSettings, ...added.rowSettings },
    frame: { ...props.frame, ...added.frame, overlays: [...props.frame?.overlays ?? [], ...added.frame?.overlays ?? []] },
})

export const useFeatures = (deals: IDataProvider, switches: IFeatureSwitches): IFeatureProps => {
    const toasts = useToastController(TOASTER_ID)
    const { formatting } = usePcfContext()
    const [openedDeal, setOpenedDeal] = React.useState<IRecord>()
    useStageGrouping(deals, switches)
    useSelectionTotal(toasts, !!switches.rowSelection)
    const context: IFeatureContext = { deals, switches, toasts, formatting, openedDeal, onOpenDeal: setOpenedDeal }
    return Object.keys(FEATURES).filter(feature => switches[feature]).map(feature => FEATURES[feature](context)).reduce(combine, getBaseProps(deals))
}

/** Draws the grid in the theme a feature picks, with the toasts the features raise. */
export const FeatureFrame = (props: IFeatureFrameProps) => <>
    {props.theme ? <ThemeProvider theme={props.theme}>{props.children}</ThemeProvider> : props.children}
    {props.overlays}
    <FluentProvider theme={webLightTheme}>
        <Toaster toasterId={TOASTER_ID} position='bottom-end' />
    </FluentProvider>
</>
`

export const SHOWCASE_FILES: IGridExampleFile[] = [
    { name: 'GridExample.tsx', code: GRID_EXAMPLE },
    { name: 'deals.ts', code: DEALS },
    { name: 'atAGlance.tsx', code: AT_A_GLANCE },
    { name: 'readOnlyList.ts', code: READ_ONLY_LIST },
    { name: 'spreadsheet.tsx', code: SPREADSHEET },
    { name: 'pipelineReview.tsx', code: PIPELINE_REVIEW },
    { name: 'closingDeals.ts', code: CLOSING_DEALS },
    { name: 'features.tsx', code: FEATURES },
]

const FEATURE_GROUPS: IShowcaseFeatureGroup[] = [
    {
        title: 'Editing',
        features: [
            { key: 'editing', label: 'Editing', hint: 'Double-click a Value or a Close date to change it, or flip Recurring right in its cell. Without Auto-save, changes are kept but not saved.' },
            { key: 'autoSave', label: 'Auto-save', hint: 'Turn on Editing too, then change a value: the row saves as soon as the cell takes it. The server refuses deals over $30,000, and the red icon at the start of the row says why.' },
        ],
    },
    {
        title: 'Selection',
        features: [
            { key: 'rowSelection', label: 'Rows', hint: 'Tick a few deals: the bar above the grid adds up their value.', options: [{ key: 'multiple', label: 'Multiple' }, { key: 'single', label: 'Single' }] },
            { key: 'cellSelection', isEnterprise: true, label: 'Cell ranges', hint: 'Drag across a block of cells to highlight it, as in a spreadsheet.' },
            { key: 'clipboard', isEnterprise: true, label: 'Copy', hint: 'Press Ctrl+C on a cell, or on a highlighted range with Cell ranges on, and paste it into a spreadsheet. With Editing on, Ctrl+V pastes back into the grid.' },
        ],
    },
    {
        title: 'Shaping the data',
        features: [
            { key: 'sorting', label: 'Sorting', hint: "Click a column's header to open its menu, and sort by it." },
            { key: 'filtering', label: 'Filtering', hint: 'Open the Stage menu, pick Filter By and keep only the deals in negotiation.' },
            { key: 'grouping', isEnterprise: true, label: 'Grouping', hint: "Open a column's menu and pick Group to group the deals by it." },
            { key: 'aggregation', label: 'Totals', hint: "Open a number column's menu and pick a total; it shows under the rows and in every group row." },
        ],
    },
    {
        title: 'Look',
        features: [
            { key: 'optionSetColors', label: 'Option set colours', hint: 'Stage and Products are drawn as tags in their own colours.' },
            { key: 'zebra', label: 'Zebra rows', hint: 'Every other row is shaded, except while the deals are grouped.' },
            { key: 'compactRows', label: 'Compact rows', hint: 'Rows are 28 pixels tall, a little roomier than in Excel.' },
        ],
    },
]

const PRESETS: IShowcasePreset[] = [
    { key: 'glance', label: 'At a glance', iconName: 'Lightbulb', description: 'Icons, colours and hints that read the pipeline for you.', features: ['editing', 'autoSave', 'rowSelection', 'cellSelection', 'clipboard', 'sorting', 'filtering', 'grouping', 'aggregation', 'optionSetColors', 'zebra', 'statusIcons', 'colourRules', 'headerExtras', 'overdueActions', 'quickViews', 'dealForm'] },
    { key: 'list', label: 'Read-only list', iconName: 'BulletedList', description: 'A list to browse: sort and filter it, with option sets in colour.', features: ['sorting', 'filtering', 'optionSetColors', 'zebra'] },
    { key: 'sheet', label: 'Spreadsheet', iconName: 'Table', description: 'Edit in place, highlight ranges and copy them out.', features: ['editing', 'cellSelection', 'clipboard', 'sorting', 'compactRows', 'excelTheme'] },
    { key: 'review', label: 'Pipeline review', iconName: 'Financial', description: 'Group by stage with totals, and select deals to add up their value.', features: ['rowSelection', 'sorting', 'filtering', 'grouping', 'aggregation', 'groupByStage', 'optionSetColors'] },
]

//what the example adds through its own code, each in a use case of its own
const EXTENSIBILITY_EXAMPLES: IShowcasePreset[] = [
    { key: 'closing', label: 'Closing deals', iconName: 'Trophy2', description: 'A row command marks deals won or lost, a module colours them by outcome and a row lock keeps them from being edited. Select a few deals and close them all at once.', features: ['editing', 'autoSave', 'rowSelection', 'sorting', 'optionSetColors', 'rowActions', 'closedDealColours', 'lockClosedDeals'] },
]

const ALL_PRESETS = [...PRESETS, ...EXTENSIBILITY_EXAMPLES]

export const ShowcaseExample = () => {
    const [features, setFeatures] = React.useState<IShowcaseFeatureValues>(() => getPresetValues(FEATURE_GROUPS, ALL_PRESETS, PRESETS[0]))
    return <GridExampleRunner
        seedCode={SHOWCASE_FILES}
        previewProps={{ features }}
        renderAbovePreview={() => <FeatureSwitcher groups={FEATURE_GROUPS} presets={ALL_PRESETS} values={features} onChange={setFeatures} />} />
}
