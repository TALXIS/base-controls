import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'
import { FeatureSwitcher, IShowcaseFeatureGroup, IShowcaseFeatureValues, IShowcasePreset } from '../showcase/FeatureSwitcher'

const GRID_EXAMPLE = `import { createDealsProvider } from './deals'
import { IFeatureSwitches, useFeatures } from './features'
import { SelectionTotal } from './pipelineReview'

interface IGridExampleProps {
    /** What the Features panel and its presets have switched on. */
    features: IFeatureSwitches
}

export const GridExample = (props: IGridExampleProps) => {
    const deals = React.useMemo(createDealsProvider, [])
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [failedSave, setFailedSave] = React.useState<IRecordSaveOperationResult>()
    const { modules, colDefs, theme, ...featureProps } = useFeatures(deals, props.features, { onSelectionChanged: setSelectedIds })

    const grid = <Grid.Root
        //modules are read once, at mount
        key={JSON.stringify(props.features)}
        provider={deals}
        modules={{ rowModel: createClientSideRowModelModule(), ...modules }}
        colDefs={{ name: { pinned: 'left' }, ...colDefs }}
        {...featureProps}
        onAfterRecordSaved={result => setFailedSave(result.success ? undefined : result)}
        height='520px' />

    return <Stack tokens={{ childrenGap: 8 }}>
        {props.features.rowSelection && <SelectionTotal deals={deals} selectedIds={selectedIds} />}
        {failedSave && <MessageBar messageBarType={MessageBarType.warning} onDismiss={() => setFailedSave(undefined)}>
            Not saved. {failedSave.errors?.map(error => error.message).join(' ')}
        </MessageBar>}
        {theme ? <ThemeProvider theme={theme}>{grid}</ThemeProvider> : grid}
    </Stack>
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

const YES_NO = [
    { Value: 0, Label: 'No', Color: '#605e5c' },
    { Value: 1, Label: 'Yes', Color: '#107c10' },
]

const TOTALS: IAttributeMetadata = { SupportedAggregations: ['sum', 'avg', 'min', 'max'] }

//sorting, filtering, grouping and editing are each switched on by the column's metadata
const createColumn = (name: string, displayName: string, dataType: DataType, width: number, metadata: IAttributeMetadata = {}): IColumn => ({
    name,
    displayName,
    dataType,
    visualSizeFactor: width,
    metadata: {
        IsValidForGrid: true,
        IsValidForUpdate: true,
        CanBeGrouped: true,
        SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(dataType).map(operator => operator.Value),
        ...metadata,
    },
})

const COLUMNS: IColumn[] = [
    createColumn('name', 'Deal', DataTypes.SingleLineText, 230),
    createColumn('owner', 'Account manager', DataTypes.SingleLineText, 160),
    createColumn('stage', 'Stage', DataTypes.OptionSet, 130, { OptionSet: STAGES }),
    createColumn('products', 'Products', DataTypes.MultiSelectOptionSet, 200, { OptionSet: PRODUCTS }),
    { ...createColumn('value', 'Value', DataTypes.Currency, 130, TOTALS), aggregation: { aggregationFunction: 'sum' } },
    createColumn('discount', 'Discount (%)', DataTypes.Decimal, 120, { ...TOTALS, Precision: 1 }),
    createColumn('closedate', 'Close date', DataTypes.DateAndTimeDateOnly, 120),
    { ...createColumn('timespent', 'Time spent', DataTypes.WholeDuration, 120, TOTALS), aggregation: { aggregationFunction: 'sum' } },
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

//while grouped, a deal is held by the provider of its group
export const findDeal = (deals: IDataProvider, recordId: string) => [deals, ...deals.getGroupedRecordDataProviders(true)].map(source => source.getRecordsMap()[recordId]).find(Boolean)
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
    editing: () => ({ enableEditing: true, colDefs: { recurring: { settings: { cell: { oneClickEdit: true } } } } }),
    autoSave: () => ({ enableAutoSave: true }),
    cellSelection: () => ({ modules: { cellSelection: createCellSelectionModule() } }),
    clipboard: () => ({ modules: { clipboard: createClipboardModule() } }),
    compactRows: () => ({ rowHeight: COMPACT_ROW_HEIGHT }),
    excelTheme: () => ({ theme: EXCEL_THEME }),
}
`

const PIPELINE_REVIEW = `import { findDeal } from './deals'
import type { IFeature } from './features'

export const PIPELINE_REVIEW: { [feature: string]: IFeature } = {
    rowSelection: ({ switches, onSelectionChanged }) => ({ modules: { rowSelection: createRowSelectionModule({ mode: switches.rowSelection || 'multiple', onSelectionChanged }) } }),
    grouping: () => ({ modules: { grouping: createGroupingModule() } }),
    aggregation: () => ({ modules: { aggregation: createAggregationModule() } }),
}

/** Groups the deals by stage while the Grouping feature is on. */
export const useStageGrouping = (deals: IDataProvider, isGrouped: boolean) => {
    React.useEffect(() => {
        const isGroupedNow = deals.grouping.getGroupBys().length > 0
        if (isGroupedNow === isGrouped) {
            return
        }
        //clear() would leave an ungrouped column read-only
        deals.grouping.getGroupBys().forEach(groupBy => deals.grouping.removeGroupBy(groupBy.alias))
        if (isGrouped) {
            deals.grouping.addGroupBy({ alias: 'stage_group', columnName: 'stage' })
        }
        deals.refresh()
    }, [isGrouped])
}

interface ISelectionTotalProps {
    deals: IDataProvider
    selectedIds: string[]
}

/** Adds up the value of the selected deals. */
export const SelectionTotal = (props: ISelectionTotalProps) => {
    const { formatting } = usePcfContext()
    const selected = props.selectedIds.map(recordId => findDeal(props.deals, recordId)).filter(Boolean)
    if (!selected.length) {
        return null
    }
    const value = selected.reduce((total, deal) => total + Number(deal.getValue('value') ?? 0), 0)
    return <MessageBar>{selected.length} selected, worth {formatting.formatCurrency(value)}.</MessageBar>
}
`

const CLOSING_DEALS = `import { findDeal, isClosed, isSummaryRow, LOST, WON } from './deals'
import type { IFeature } from './features'

//the field saves the deal while auto-save is on
const closeDeal = async (runtime: IGridRuntime, deal: IRecord, stage: number) => {
    const result = await runtime.services.get('fields').get(deal, 'stage').setValue(stage)
    if (result && !result.success) {
        deal.clearChanges()
    }
}

/** Mark as won and Mark as lost in the actions column; on a selected deal they close every selected deal. */
const dealCommands: IGridModule = {
    onRegister: runtime => {
        const deals = runtime.services.get('provider')
        const closeDeals = (deal: IRecord, stage: number) => {
            const selectedIds = deals.getSelectedRecordIds()
            const targets = selectedIds.includes(deal.getRecordId()) ? selectedIds.map(recordId => findDeal(deals, recordId)) : [deal]
            targets.filter(target => target && !isClosed(target)).forEach(target => closeDeal(runtime, target, stage))
        }
        runtime.services.get('cells').registerCellCommandsHook((result, { record, columnName }) => {
            if (columnName !== 'actions' || isSummaryRow(record) || isClosed(record)) {
                return
            }
            result.items.push({ key: 'won', title: 'Mark as won', iconProps: { iconName: 'Trophy2' }, onClick: () => closeDeals(record, WON) })
            result.items.push({ key: 'lost', title: 'Mark as lost', iconProps: { iconName: 'Cancel' }, onClick: () => closeDeals(record, LOST) })
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

const BUSINESS_RULES = `import { isClosed, isSummaryRow } from './deals'
import type { IFeature } from './features'

const validateDiscount = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    if (Number(record.getValue('discount') ?? 0) > 20) {
        result.error = true
        result.errorMessage = 'A discount over 20 % needs a manager.'
    }
}

const highlightOverdue = (theme: ThemeBuilder, { record }: { record: IRecord }) => {
    const closeDate = record.getValue('closedate')
    if (!isSummaryRow(record) && !isClosed(record) && closeDate && dayjs(closeDate).isBefore(dayjs(), 'day')) {
        theme.colors.text = '#a4262c'
    }
}

export const BUSINESS_RULES: { [feature: string]: IFeature } = {
    discountRule: () => ({ colDefs: { discount: { settings: { cell: { onGetValidation: validateDiscount } } } } }),
    overdueDates: () => ({ colDefs: { closedate: { settings: { cell: { onGetTheme: highlightOverdue } } } } }),
}
`

const FEATURES = `import { BUSINESS_RULES } from './businessRules'
import { CLOSING_DEALS } from './closingDeals'
import { PIPELINE_REVIEW, useStageGrouping } from './pipelineReview'
import { READ_ONLY_LIST } from './readOnlyList'
import { SPREADSHEET } from './spreadsheet'

//turns the switches of the Features panel into grid props; a grid of your own sets them directly

/** What the Features panel has switched on, with the row selection mode when rows can be selected. */
export interface IFeatureSwitches {
    rowSelection?: 'single' | 'multiple' | false
    [feature: string]: boolean | string | undefined
}

/** What a feature adds to the grid, besides the theme it is drawn in. */
export type IFeatureProps = Omit<Partial<IGrid>, 'modules'> & { modules?: Partial<IGridModules>; theme?: ITheme }

export interface IFeatureContext {
    switches: IFeatureSwitches
    onSelectionChanged: (recordIds: string[]) => void
}

export type IFeature = (context: IFeatureContext) => IFeatureProps

const FEATURES: { [feature: string]: IFeature } = { ...READ_ONLY_LIST, ...SPREADSHEET, ...PIPELINE_REVIEW, ...CLOSING_DEALS, ...BUSINESS_RULES }

//modules, columns and row settings add up across the features
const combine = (props: IFeatureProps, added: IFeatureProps): IFeatureProps => ({
    ...props,
    ...added,
    modules: { ...props.modules, ...added.modules, custom: [...props.modules?.custom ?? [], ...added.modules?.custom ?? []] },
    colDefs: { ...props.colDefs, ...added.colDefs },
    rowSettings: { ...props.rowSettings, ...added.rowSettings },
})

export const useFeatures = (deals: IDataProvider, switches: IFeatureSwitches, handlers: Omit<IFeatureContext, 'switches'>): IFeatureProps => {
    useStageGrouping(deals, !!switches.grouping)
    const context = { ...handlers, switches }
    return Object.keys(FEATURES).filter(feature => switches[feature]).map(feature => FEATURES[feature](context)).reduce(combine, {})
}
`

export const SHOWCASE_FILES: IGridExampleFile[] = [
    { name: 'GridExample.tsx', code: GRID_EXAMPLE },
    { name: 'deals.ts', code: DEALS },
    { name: 'readOnlyList.ts', code: READ_ONLY_LIST },
    { name: 'spreadsheet.ts', code: SPREADSHEET },
    { name: 'pipelineReview.tsx', code: PIPELINE_REVIEW },
    { name: 'closingDeals.ts', code: CLOSING_DEALS },
    { name: 'businessRules.ts', code: BUSINESS_RULES },
    { name: 'features.ts', code: FEATURES },
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
            { key: 'grouping', isEnterprise: true, label: 'Grouping', hint: 'Deals are grouped by Stage. Open the Account manager menu and pick Group to group by it too.' },
            { key: 'aggregation', label: 'Totals', hint: "Value and Time spent are totalled under the rows, and in every group row. Pick another total from a number column's menu." },
        ],
    },
    {
        title: 'Look',
        features: [
            { key: 'optionSetColors', label: 'Option set colours', hint: 'Stage and Products are drawn as tags in their own colours, and so is Recurring while Editing is off.' },
            { key: 'zebra', label: 'Zebra rows', hint: 'Every other row is shaded, except while the deals are grouped.' },
            { key: 'compactRows', label: 'Compact rows', hint: 'Rows are 28 pixels tall, a little roomier than in Excel.' },
        ],
    },
]

const PRESETS: IShowcasePreset[] = [
    { key: 'list', label: 'Read-only list', iconName: 'BulletedList', description: 'A list to browse: sort and filter it, with option sets in colour.', features: ['sorting', 'filtering', 'optionSetColors', 'zebra'] },
    { key: 'sheet', label: 'Spreadsheet', iconName: 'Table', description: 'Edit in place, highlight ranges and copy them out.', features: ['editing', 'cellSelection', 'clipboard', 'sorting', 'compactRows', 'excelTheme'] },
    { key: 'review', label: 'Pipeline review', iconName: 'Financial', description: 'Group by stage with totals, and select deals to add up their value.', features: ['rowSelection', 'sorting', 'filtering', 'grouping', 'aggregation', 'optionSetColors'] },
]

//what the example adds through its own code, each in a use case of its own
const EXTENSIBILITY_EXAMPLES: IShowcasePreset[] = [
    { key: 'closing', label: 'Closing deals', iconName: 'Trophy2', description: 'A row command marks deals won or lost, a module colours them by outcome and a row lock keeps them from being edited. Select a few deals and close them all at once.', features: ['editing', 'autoSave', 'rowSelection', 'sorting', 'optionSetColors', 'rowActions', 'closedDealColours', 'lockClosedDeals'] },
    { key: 'rules', label: 'Business rules', iconName: 'Shield', description: 'A cell rule refuses a Discount over 20 %, and a cell theme draws overdue close dates in red. Edit a Discount to see the rule.', features: ['editing', 'autoSave', 'sorting', 'filtering', 'optionSetColors', 'discountRule', 'overdueDates'] },
]

export const ShowcaseExample = () => {
    const [features, setFeatures] = React.useState<IShowcaseFeatureValues>(Object.fromEntries(PRESETS[0].features.map(key => [key, true])))
    return <GridExampleRunner
        seedCode={SHOWCASE_FILES}
        previewProps={{ features }}
        renderAbovePreview={() => <FeatureSwitcher groups={FEATURE_GROUPS} presets={[...PRESETS, ...EXTENSIBILITY_EXAMPLES]} values={features} onChange={setFeatures} />} />
}
