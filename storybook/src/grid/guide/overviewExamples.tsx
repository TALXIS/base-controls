import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import type { IGridExampleFile } from '../GridLivePreview'
import { FeatureSwitcher, getPresetValues, IShowcaseFeatureGroup, IShowcaseFeatureValues, IShowcasePreset } from '../showcase/FeatureSwitcher'
import { DEAL_LIST_TABS, withDealGrid } from './dealGridFiles'

const GRID_EXAMPLE = `import { ClientSideGrid, DatasetControl } from '@talxis/base-controls'
import { dealColumns, deals, DealsProvider, metadata } from './deals'
import { FeatureFrame, IFeatureSwitches, useFeatures } from './features'

interface IGridExampleProps {
    /** What the Features panel and its presets have switched on. */
    features: IFeatureSwitches
}

export const GridExample = (props: IGridExampleProps) => {
    //kept across feature changes so grouping and selection stay
    const provider = React.useMemo(() => new DealsProvider({ dataSource: deals, metadata, columns: dealColumns }), [])
    const { modules, frame, ...featureProps } = useFeatures(provider, props.features)

    return <FeatureFrame {...frame}>
        <DatasetControl onLoad={async () => ({ provider })} height='520px'>
            <DatasetControl.Body>
                <ClientSideGrid
                    //modules are read at mount
                    key={JSON.stringify(props.features)} modules={modules}
                    {...featureProps} />
            </DatasetControl.Body>
        </DatasetControl>
    </FeatureFrame>
}
`

const PIPELINE = `import { IDataProvider, IRecord } from '@talxis/client-libraries'
import { deals } from './deals'

export const WON = 4
export const LOST = 5

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

const LARGEST_VALUE = Math.max(...deals.map(deal => Number(deal.value)))

/** How big a value is next to the largest deal, from 0 to 1. */
export const getValueShare = (value: number) => value / LARGEST_VALUE

//a grouped deal is held by the provider of its group
export const findDeal = (provider: IDataProvider, recordId: string) => [provider, ...provider.getGroupedRecordDataProviders(true)].map(source => source.getRecordsMap()[recordId]).find(Boolean)
`

const AT_A_GLANCE = `import { Form, GRID_MODULE_PRIORITY, IGrid, IGridModule, ITintStrength } from '@talxis/base-controls'
import { IRecord, Operators, Type } from '@talxis/client-libraries'
import { Icon, Panel, PanelType } from '@fluentui/react'
import { getCloseDateState, getValueShare, isClosed, isOverdue, isSummaryRow, LOST, WON } from './pipeline'
import type { IFeature } from './features'

/** What a cell shows: a grouped column draws its value in the group's row rather than in the deal's. */
const getShownValue = (grid: IGrid, record: IRecord, columnName: string) => {
    const grouping = grid.modules.find('grouping')
    const column = grid.services.get('provider').getColumnsMap()[columnName]
    if (column && grouping?.isColumnGrouped(column)) {
        return grouping.isRowGroupedBy(record, columnName) ? record.getValue(grouping.getGroupedValueColumnName(record, columnName)) : undefined
    }
    return isSummaryRow(record) ? undefined : record.getValue(columnName)
}

const CLOSE_DATE_ICONS = { overdue: 'Warning', dueThisWeek: 'Clock' }
const CLOSE_DATE_HUES = { overdue: '#d13438', dueThisWeek: '#c19c00' }
const VALUE_HUE = '#107c10'
//from untinted to strong green by deal size
const VALUE_STRENGTHS: (ITintStrength | undefined)[] = [undefined, 'subtle', 'strong']

/** An icon before overdue and due close dates. */
const statusIcons: IGridModule = {
    name: 'statusIcons',
    onLoad: grid => {
        grid.services.get('cells').hooks.controlParameters.add((parameters, { record, columnName }) => {
            const value = getShownValue(grid, record, columnName)
            const state = columnName === 'closedate' && !isClosed(record) ? getCloseDateState(value) : undefined
            if (state) {
                parameters.PrefixIcon = { raw: CLOSE_DATE_ICONS[state] }
            }
        })
    },
}

/** Close dates tinted red when overdue and amber when due this week, and Value tinted by deal size. */
const colourRules: IGridModule = {
    name: 'colourRules',
    onLoad: grid => {
        //runs after grouping repaints the rows
        grid.services.get('cells').hooks.theme.add((builder, { record, columnName }) => {
            const value = getShownValue(grid, record, columnName)
            if (value == null || isClosed(record)) {
                return
            }
            const state = columnName === 'closedate' ? getCloseDateState(value) : undefined
            if (state) {
                builder.tint(CLOSE_DATE_HUES[state])
            }
            const strength = columnName === 'value' ? VALUE_STRENGTHS[Math.min(Math.floor(getValueShare(Number(value)) * VALUE_STRENGTHS.length), VALUE_STRENGTHS.length - 1)] : undefined
            if (strength) {
                builder.tint(VALUE_HUE, strength)
            }
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

/** What the colours and icons in Close date mean. */
const headerExtras: IGridModule = {
    name: 'headerExtras',
    onLoad: grid => {
        grid.services.get('columns').headers.hooks.adornments.add((adornments, header) => {
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
    name: 'overdueActions',
    onLoad: grid => {
        //room for the commands beside the date
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            columnDefs.find(colDef => colDef.colId === 'closedate')!.initialWidth = 320
        })
        //the field saves the deal while auto-save is on
        const pushBack = (deal: IRecord, days: number) => grid.services.get('fields').get(deal, 'closedate').setValue(dayjs().add(days, 'day').startOf('day').toDate())
        grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            if (columnName !== 'closedate' || !isOverdue(record) || getShownValue(grid, record, columnName) == null) {
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
    name: 'quickViews',
    onLoad: grid => {
        const provider = grid.services.get('provider')
        const show = (conditions: ICondition[] | null) => {
            provider.setFiltering(conditions ? { filterOperator: Type.And.Value, conditions } : null)
            provider.refresh()
        }
        grid.services.get('columns').headers.hooks.menuSections.add((sections, header) => {
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
    { label: 'Deal', columnNames: ['name', 'owner', 'stage'] },
    { label: 'Money', columnNames: ['value', 'discount', 'probability', 'recurring'] },
    { label: 'Timing', columnNames: ['closedate', 'nextstep'] },
]

/** The deal in a form, saved from its ribbon. */
const DealForm = (props: { deal: IRecord }) => {
    return <Form.Root key={props.deal.getRecordId()} onLoad={async () => ({ record: props.deal })}>
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

const DealPanel = (props: { deal?: IRecord; onDismiss: () => void }) => <Panel isOpen={!!props.deal} headerText={props.deal?.getValue('name')} type={PanelType.medium} isLightDismiss onDismiss={props.onDismiss}>
    {props.deal && <DealForm key={props.deal.getRecordId()} deal={props.deal} />}
</Panel>

/** The Deal link and an Open in a form command beside every deal's name, both opening the deal in a panel. */
const createOpenInForm = (onOpenDeal: (deal: IRecord) => void): IGridModule => ({
    name: 'openInForm',
    onLoad: grid => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            const name = columnDefs.find(colDef => colDef.colId === 'name')!
            name.context = { ...name.context, isPrimary: true }
        })
        grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            if (columnName !== 'name' || isSummaryRow(record)) {
                return
            }
            result.items.push({ key: 'openInForm', text: 'Open in a form', iconOnly: true, iconProps: { iconName: 'OpenPane' }, onClick: () => grid.openRecord({ record, reference: record.getNamedReference(), columnName }) })
        })
        //a handled request is not passed on to the provider
        grid.hooks.openRecord.add(request => {
            request.isHandled = true
            onOpenDeal(request.record)
        })
    },
})

export const AT_A_GLANCE: { [feature: string]: IFeature } = {
    statusIcons: () => ({ modules: [statusIcons] }),
    colourRules: () => ({ modules: [colourRules] }),
    headerExtras: () => ({ modules: [headerExtras] }),
    overdueActions: () => ({ modules: [overdueActions] }),
    quickViews: () => ({ modules: [quickViews] }),
    dealForm: ({ openedDeal, onOpenDeal }) => ({
        modules: [createOpenInForm(onOpenDeal)],
        frame: { overlays: [<DealPanel key='dealPanel' deal={openedDeal} onDismiss={() => onOpenDeal(undefined)} />] },
    }),
}
`

const READ_ONLY_LIST = `import { createFilteringModule, createSortingModule } from '@talxis/base-controls'
import type { IFeature } from './features'

export const READ_ONLY_LIST: { [feature: string]: IFeature } = {
    sorting: () => ({ modules: [createSortingModule()] }),
    filtering: () => ({ modules: [createFilteringModule()] }),
    optionSetColors: () => ({ enableOptionSetColors: true }),
    zebra: () => ({ enableZebra: true }),
}
`

const SPREADSHEET = `import { createCellSelectionModule, createClipboardModule, createEditingModule, IGridModule } from '@talxis/base-controls'
import type { IFeature } from './features'

//a little roomier than Excel's 20 pixels
const COMPACT_ROW_HEIGHT = 28

/** Recurring is edited right in its cell. */
const recurringSwitch: IGridModule = {
    name: 'recurringSwitch',
    onLoad: grid => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            const recurring = columnDefs.find(colDef => colDef.colId === 'recurring')!
            recurring.context = { ...recurring.context, oneClickEdit: true }
        })
    },
}

export const SPREADSHEET: { [feature: string]: IFeature } = {
    //the Auto-save switch is the editing module's enableAutoSave option
    editing: ({ switches }) => ({
        modules: [createEditingModule({ enableAutoSave: !!switches.autoSave }), recurringSwitch],
    }),
    cellSelection: () => ({ modules: [createCellSelectionModule()] }),
    clipboard: () => ({ modules: [createClipboardModule()] }),
    compactRows: () => ({ rowHeight: COMPACT_ROW_HEIGHT }),
}
`

const PIPELINE_REVIEW = `import { createAggregationModule, createGroupingModule, createRowSelectionModule } from '@talxis/base-controls'
import { IAggregationMetadata, IDataProvider, IGroupByMetadata } from '@talxis/client-libraries'
import type { IFeature, IFeatureSwitches } from './features'

export const PIPELINE_REVIEW: { [feature: string]: IFeature } = {
    rowSelection: ({ switches }) => ({
        modules: [createRowSelectionModule({ mode: switches.rowSelection || 'multiple' })],
    }),
    grouping: () => ({ modules: [createGroupingModule()] }),
    aggregation: () => ({ modules: [createAggregationModule()] }),
}

const STAGE_GROUP: IGroupByMetadata = { alias: 'stage_group', columnName: 'stage' }

const STAGE_TOTALS: IAggregationMetadata[] = [
    { alias: 'value_sum', columnName: 'value', aggregationFunction: 'sum' },
    { alias: 'probability_avg', columnName: 'probability', aggregationFunction: 'avg' },
]

/** Groups the deals by stage with totals for the Pipeline review preset, and clears what the user grouped or totalled when the features change. */
export const useStageGrouping = (provider: IDataProvider, switches: IFeatureSwitches) => {
    const isReviewed = !!switches.groupByStage
    React.useEffect(() => {
        const groupBys = provider.grouping.getGroupBys()
        const aggregations = provider.aggregation.getAggregations()
        if (!groupBys.length && !aggregations.length && !isReviewed) {
            return
        }
        //clear() would leave an ungrouped column read-only
        groupBys.forEach(groupBy => provider.grouping.removeGroupBy(groupBy.alias))
        aggregations.forEach(aggregation => provider.aggregation.removeAggregation(aggregation.alias))
        if (isReviewed) {
            provider.grouping.addGroupBy(STAGE_GROUP)
            STAGE_TOTALS.forEach(total => provider.aggregation.addAggregation(total))
        }
        provider.refresh()
    }, [switches.grouping, switches.aggregation, isReviewed])
}
`

const CLOSING_DEALS = `import { IGrid, IGridModule, GRID_MODULE_PRIORITY } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { findDeal, isClosed, isSummaryRow, LOST, WON } from './pipeline'
import type { IFeature } from './features'

//the field saves the deal while auto-save is on
const closeDeal = async (grid: IGrid, deal: IRecord, stage: number) => {
    const result = await grid.services.get('fields').get(deal, 'stage').setValue(stage)
    //a refused save leaves the deal as it was
    if (result && !result.success) {
        deal.clearChanges()
    }
}

/** Mark as won and Mark as lost in the actions column; on a selected deal they close every selected deal. */
const dealCommands: IGridModule = {
    name: 'dealCommands',
    onLoad: grid => {
        const provider = grid.services.get('provider')
        const closeDeals = async (deal: IRecord, stage: number) => {
            const selectedIds = provider.getSelectedRecordIds()
            const targets = selectedIds.includes(deal.getRecordId()) ? selectedIds.map(recordId => findDeal(provider, recordId)) : [deal]
            await Promise.all(targets.filter(target => target && !isClosed(target)).map(target => closeDeal(grid, target, stage)))
        }
        const columns = grid.services.get('columns')
        columns.hooks.columnDefinitions.add(columnDefs => {
            //a column of the grid's own: its cells hold only the commands added below
            columnDefs.push(columns.createUnboundColDef({ colId: 'actions', pinned: 'right', initialWidth: 96 }))
        })
        grid.services.get('cells').hooks.commands.add((result, { record, columnName }) => {
            if (columnName !== 'actions' || isSummaryRow(record) || isClosed(record)) {
                return
            }
            result.items.push({ key: 'won', text: 'Mark as won', iconOnly: true, iconProps: { iconName: 'Trophy2' }, onClick: () => { closeDeals(record, WON) } })
            result.items.push({ key: 'lost', text: 'Mark as lost', iconOnly: true, iconProps: { iconName: 'Cancel' }, onClick: () => { closeDeals(record, LOST) } })
        })
    },
}

/** Paints won deals green and lost ones red. */
const closedDealColours: IGridModule = {
    name: 'closedDealColours',
    onLoad: grid => {
        //runs after grouping repaints the rows
        grid.services.get('cells').hooks.theme.add((builder, { record }) => {
            if (isSummaryRow(record) || !isClosed(record)) {
                return
            }
            builder.tint(Number(record.getValue('stage')) === WON ? '#107c10' : '#d13438')
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

/** Locks won and lost deals as a whole. */
const lockClosedDeals: IGridModule = {
    name: 'lockClosedDeals',
    onLoad: grid => {
        grid.modules.observe('editing', editing => editing.locks.hooks.row.add((result, { record }) => {
            if (!isSummaryRow(record) && isClosed(record)) {
                result.isLocked = true
            }
        }))
    },
}

export const CLOSING_DEALS: { [feature: string]: IFeature } = {
    rowActions: () => ({ modules: [dealCommands] }),
    closedDealColours: () => ({ modules: [closedDealColours] }),
    lockClosedDeals: () => ({ modules: [lockClosedDeals] }),
}
`

const FEATURES = `import { IGridModule, IGridProps } from '@talxis/base-controls'
import { IDataProvider, IRecord } from '@talxis/client-libraries'
import { AT_A_GLANCE } from './atAGlance'
import { CLOSING_DEALS } from './closingDeals'
import { PIPELINE_REVIEW, useStageGrouping } from './pipelineReview'
import { READ_ONLY_LIST } from './readOnlyList'
import { SPREADSHEET } from './spreadsheet'

//turns the Features panel's switches into grid props

/** What the Features panel has switched on, with the row selection mode when rows can be selected. */
export interface IFeatureSwitches {
    rowSelection?: 'single' | 'multiple' | false
    [feature: string]: boolean | string | undefined
}

/** What is drawn around the grid. */
interface IFeatureFrameProps {
    /** Drawn beside the grid, such as panels. */
    overlays?: JSX.Element[]
    children?: JSX.Element
}

/** What a feature adds to the grid, and to what is drawn around it. */
export type IFeatureProps = Omit<Partial<IGridProps>, 'modules'> & { modules?: IGridModule[]; frame?: IFeatureFrameProps }

/** What the feature code shares. */
export interface IFeatureContext {
    switches: IFeatureSwitches
    /** The deal open in a form, if any. */
    openedDeal?: IRecord
    onOpenDeal: (deal?: IRecord) => void
}

export type IFeature = (context: IFeatureContext) => IFeatureProps

const FEATURES: { [feature: string]: IFeature } = { ...AT_A_GLANCE, ...READ_ONLY_LIST, ...SPREADSHEET, ...PIPELINE_REVIEW, ...CLOSING_DEALS }

/** The deal's name stays in view while nothing is grouped. */
const createPinnedName = (provider: IDataProvider): IGridModule => ({
    name: 'pinnedName',
    onLoad: grid => {
        grid.services.get('columns').hooks.columnDefinitions.add(columnDefs => {
            if (provider.grouping.getGroupBys().length === 0) {
                columnDefs.find(colDef => colDef.colId === 'name')!.pinned = 'left'
            }
        })
    },
})

const getBaseProps = (provider: IDataProvider): IFeatureProps => ({
    //the grid shades every other row unless told not to
    enableZebra: false,
    modules: [createPinnedName(provider)],
})

//modules and overlays add up across the features
const combine = (props: IFeatureProps, added: IFeatureProps): IFeatureProps => ({
    ...props,
    ...added,
    modules: [...props.modules ?? [], ...added.modules ?? []],
    frame: { ...props.frame, ...added.frame, overlays: [...props.frame?.overlays ?? [], ...added.frame?.overlays ?? []] },
})

export const useFeatures = (provider: IDataProvider, switches: IFeatureSwitches): IFeatureProps => {
    const [openedDeal, setOpenedDeal] = React.useState<IRecord>()
    useStageGrouping(provider, switches)
    const context: IFeatureContext = { switches, openedDeal, onOpenDeal: setOpenedDeal }
    return Object.keys(FEATURES).filter(feature => switches[feature]).map(feature => FEATURES[feature](context)).reduce(combine, getBaseProps(provider))
}

/** Draws the grid with the panels the features open. */
export const FeatureFrame = (props: IFeatureFrameProps) => <>
    {props.children}
    {props.overlays}
</>
`

const SHOWCASE_FILES: IGridExampleFile[] = withDealGrid(GRID_EXAMPLE,
    { name: 'pipeline.ts', code: PIPELINE },
    { name: 'atAGlance.tsx', code: AT_A_GLANCE },
    { name: 'readOnlyList.ts', code: READ_ONLY_LIST },
    { name: 'spreadsheet.tsx', code: SPREADSHEET },
    { name: 'pipelineReview.tsx', code: PIPELINE_REVIEW },
    { name: 'closingDeals.ts', code: CLOSING_DEALS },
    { name: 'features.tsx', code: FEATURES },
    { name: 'types.ts', code: `//names each module for TypeScript; none of their onLoads returns anything
declare module '@talxis/base-controls' {
    interface IGridModuleMap {
        statusIcons: void
        colourRules: void
        headerExtras: void
        overdueActions: void
        quickViews: void
        openInForm: void
        recurringSwitch: void
        dealCommands: void
        closedDealColours: void
        lockClosedDeals: void
        pinnedName: void
    }
}
` },
)

const FEATURE_GROUPS: IShowcaseFeatureGroup[] = [
    {
        title: 'Editing',
        features: [
            { key: 'editing', label: 'Editing', hint: 'Double-click a Value or a Close date to change it, or change Recurring right in its cell. Without Auto-save, changes are kept but not saved.' },
            { key: 'autoSave', label: 'Auto-save', hint: 'Turn on Editing too, then change a value: the row saves as soon as the cell takes it. The CRM refuses a discount over 20%, and the red icon at the start of the row says why.' },
        ],
    },
    {
        title: 'Selection',
        features: [
            { key: 'rowSelection', label: 'Rows', hint: 'Tick deals to select them.', options: [{ key: 'multiple', label: 'Multiple' }, { key: 'single', label: 'Single' }] },
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
        isCore: true,
        features: [
            { key: 'optionSetColors', label: 'Option set colours', hint: 'Stage and Recurring are drawn as tags in their own colours.' },
            { key: 'zebra', label: 'Zebra rows', hint: 'Every other row is shaded, except while the deals are grouped.' },
            { key: 'compactRows', label: 'Compact rows', hint: 'Rows are 28 pixels tall, a little roomier than in Excel.' },
        ],
    },
]

const PRESETS: IShowcasePreset[] = [
    { key: 'glance', label: 'At a glance', iconName: 'Lightbulb', description: 'Icons, colours and hints on the deals that need attention.', features: ['editing', 'autoSave', 'rowSelection', 'cellSelection', 'clipboard', 'sorting', 'filtering', 'grouping', 'aggregation', 'optionSetColors', 'zebra', 'statusIcons', 'colourRules', 'headerExtras', 'overdueActions', 'quickViews', 'dealForm'] },
    { key: 'list', label: 'Read-only list', iconName: 'BulletedList', description: 'A list to browse: sort and filter it, with option sets in colour.', features: ['sorting', 'filtering', 'optionSetColors', 'zebra'] },
    { key: 'sheet', label: 'Spreadsheet', iconName: 'Table', description: 'Edit in place, highlight ranges and copy them out.', features: ['editing', 'cellSelection', 'clipboard', 'sorting', 'compactRows'] },
    { key: 'review', label: 'Pipeline review', iconName: 'Financial', description: 'Group by stage with totals, and select deals.', features: ['rowSelection', 'sorting', 'filtering', 'grouping', 'aggregation', 'groupByStage', 'optionSetColors'] },
]

//presets for the example's own modules
const EXTENSIBILITY_EXAMPLES: IShowcasePreset[] = [
    { key: 'closing', label: 'Closing deals', iconName: 'Trophy2', description: 'A row command marks deals won or lost, a module colours them by outcome and a row lock keeps them from being edited. Select a few deals and close them all at once.', features: ['editing', 'autoSave', 'rowSelection', 'sorting', 'optionSetColors', 'rowActions', 'closedDealColours', 'lockClosedDeals'] },
]

const ALL_PRESETS = [...PRESETS, ...EXTENSIBILITY_EXAMPLES]

export const ShowcaseExample = () => {
    const [features, setFeatures] = React.useState<IShowcaseFeatureValues>(() => getPresetValues(FEATURE_GROUPS, ALL_PRESETS, PRESETS[0]))
    return <GridExampleRunner
        seedCode={SHOWCASE_FILES}
        previewProps={{ features }}
        tabs={DEAL_LIST_TABS}
        renderAbovePreview={() => <FeatureSwitcher groups={FEATURE_GROUPS} presets={ALL_PRESETS} values={features} onChange={setFeatures} />} />
}
