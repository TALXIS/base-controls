import React from 'react'
import dayjs from 'dayjs'
import type { MemoryDataProvider } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDealsProvider, DEAL_COLUMNS, DEAL_DETAIL_COLUMNS, DEAL_ROWS } from '../data'
import { FeatureSwitcher, IShowcaseFeatureGroup, IShowcaseFeatureValues, IShowcasePreset } from '../showcase/FeatureSwitcher'

export const SHOWCASE_CODE = `const WON = 4
const LOST = 5
//a little roomier than Excel's 20 pixels
const COMPACT_ROW_HEIGHT = 28

const EXCEL_BASE_THEME = ThemeGenerator.generate({ primary: '#217346', background: '#ffffff', text: '#000000' })
//the grid draws its row lines in the divider colour
const EXCEL_THEME = { ...EXCEL_BASE_THEME, semanticColors: { ...EXCEL_BASE_THEME.semanticColors, menuDivider: '#d4d4d4' } }

const isSummaryRow = (record: IRecord) => record.getDataProvider().getSummarizationType() !== 'none'
const isClosed = (record: IRecord) => [WON, LOST].includes(Number(record.getValue('stage')))

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

const validateDiscount = (result: IFieldValidationResult, { record }: { record: IRecord }) => {
    if (Number(record.getValue('discount') ?? 0) > 20) {
        result.error = true
        result.errorMessage = 'A discount over 20 % needs a manager.'
    }
}

interface IShowcaseProps {
    features: { [feature: string]: boolean }
    rowSelection?: 'single' | 'multiple'
}

const GridExample = (props: IShowcaseProps) => {
    const { features, rowSelection } = props
    const { formatting } = usePcfContext()
    const [selection, setSelection] = React.useState<string[]>([])
    const [lastSave, setLastSave] = React.useState<IRecordSaveOperationResult>()
    const selectedIds = rowSelection ? selection : []
    const selectedValue = selectedIds.reduce((total, recordId) => total + Number(findDeal(recordId)?.getValue('value') ?? 0), 0)

    //a command on a selected deal closes every selected deal
    const closeDeals = (record: IRecord, stage: number) => {
        const selected = rowSelection ? provider.getSelectedRecordIds() : []
        const targets = selected.includes(record.getRecordId()) ? selected.map(findDeal) : [record]
        for (const target of targets) {
            if (target && !isClosed(target)) {
                saveValue(target, 'stage', stage)
            }
        }
    }

    const grid = <Grid.Root
        key={JSON.stringify(props)}
        provider={provider}
        modules={{
            rowModel: createClientSideRowModelModule(),
            rowSelection: rowSelection ? createRowSelectionModule({ mode: rowSelection, onSelectionChanged: setSelection }) : undefined,
            cellSelection: features.cellSelection ? createCellSelectionModule() : undefined,
            clipboard: features.clipboard ? createClipboardModule() : undefined,
            sorting: features.sorting ? createSortingModule() : undefined,
            filtering: features.filtering ? createFilteringModule() : undefined,
            grouping: features.grouping ? createGroupingModule() : undefined,
            aggregation: features.aggregation ? createAggregationModule() : undefined,
            custom: features.closedDealColours ? [closedDealColoursModule] : [],
        }}
        colDefs={{
            name: { pinned: 'left' },
            recurring: { settings: { cell: { oneClickEdit: features.editing } } },
            ...(features.discountRule && { discount: { settings: { cell: { onGetValidation: validateDiscount } } } }),
            ...(features.overdueDates && {
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
            }),
            ...(features.rowActions && { actions: {
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
            } }),
        }}
        enableEditing={features.editing}
        enableAutoSave={features.autoSave}
        enableOptionSetColors={features.optionSetColors}
        enableZebra={features.zebra}
        rowHeight={features.compactRows ? COMPACT_ROW_HEIGHT : undefined}
        rowSettings={features.lockClosedDeals ? { onGetLock: lockClosedDeals } : undefined}
        onAfterRecordSaved={setLastSave}
        height='520px' />

    return <Stack tokens={{ childrenGap: 8 }}>
        {selectedIds.length > 0 && <MessageBar>{selectedIds.length} selected, worth {formatting.formatCurrency(selectedValue)}.</MessageBar>}
        {lastSave && !lastSave.success && <MessageBar messageBarType={MessageBarType.warning} onDismiss={() => setLastSave(undefined)}>
            {'Not saved. ' + (lastSave.errors ?? []).map(error => error.message).join(' ')}
        </MessageBar>}
        {features.excelTheme ? <ThemeProvider theme={EXCEL_THEME}>{grid}</ThemeProvider> : grid}
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

    const { rowSelection, ...switches } = features

    return <GridExampleRunner
        seedCode={SHOWCASE_CODE}
        onCreateProvider={createProvider}
        previewProps={{ features: switches, rowSelection: rowSelection || undefined }}
        renderAbovePreview={() => <FeatureSwitcher groups={FEATURE_GROUPS} presets={[...PRESETS, ...EXTENSIBILITY_EXAMPLES]} values={features} onChange={onChange} />} />
}
