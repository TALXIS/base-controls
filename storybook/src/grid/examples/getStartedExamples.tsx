import React from 'react'
import { IColumn } from '@talxis/client-libraries'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsProvider, DOCS_COLUMNS, DOCS_OVERVIEW_COLUMNS, DOCS_ROWS } from '../gridDocsData'

export const OVERVIEW_CODE = `const WON = 4
const LOST = 5

const isSummaryRow = (record: IRecord) => record.getDataProvider().getSummarizationType() !== 'none'
const isWon = (record: IRecord) => Number(record.getValue('stage')) === WON
const isLost = (record: IRecord) => Number(record.getValue('stage')) === LOST
const formatMoney = (amount: number) => '$' + amount.toLocaleString('en-US')

const isOverdue = (record: IRecord) => {
    const closeDate = record.getValue('closedate')
    return !isSummaryRow(record) && !isWon(record) && !!closeDate && new Date(closeDate) < new Date()
}

//a deal that is won or lost is closed
const lockClosedDeals = (result: { isLocked: boolean }, { record }: { record: IRecord }) => {
    if (!isSummaryRow(record) && (isWon(record) || isLost(record))) {
        result.isLocked = true
    }
}

//a closed deal is coloured in every cell: green once won, red once lost
const closedDealsModule: IGridModule = {
    onRegister: runtime => {
        //after grouping, which puts a grouped record back on the grid's own background
        runtime.services.get('cells').registerCellThemeHook((theme, { record }) => {
            if (isSummaryRow(record)) {
                return
            }
            if (isWon(record)) {
                theme.colors.background = '#dff6dd'
                theme.colors.text = '#0b6a0b'
            }
            if (isLost(record)) {
                theme.colors.background = '#fde7e9'
                theme.colors.text = '#a4262c'
            }
        }, GRID_MODULE_PRIORITY.grouping + 1)
    },
}

//a command on a selected row acts on the whole selection, read when it is drawn
const getTargets = (record: IRecord) => {
    const selectedIds = provider.getSelectedRecordIds()
    return selectedIds.includes(record.getRecordId())
        ? selectedIds.map(id => provider.getRecordsMap()[id]).filter(Boolean)
        : [record]
}

//each one switches a module or a prop; the grid remounts, since both are read when it mounts
const FEATURES = [
    { key: 'editing', label: 'Editing' },
    { key: 'autoSave', label: 'Auto-save' },
    { key: 'rowSelection', label: 'Row selection' },
    { key: 'cellSelection', label: 'Cell selection' },
    { key: 'clipboard', label: 'Clipboard' },
    { key: 'sorting', label: 'Sorting' },
    { key: 'filtering', label: 'Filtering' },
    { key: 'grouping', label: 'Grouping' },
    { key: 'aggregation', label: 'Totals' },
    { key: 'optionSetColors', label: 'Option set colours' },
    { key: 'zebra', label: 'Zebra rows' },
]

const ALL_OFF: { [feature: string]: boolean } = Object.fromEntries(FEATURES.map(feature => [feature.key, false]))

const GridExample = () => {
    const [features, setFeatures] = React.useState(ALL_OFF)
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [status, setStatus] = React.useState('Switch features on above, then try them: edit a value, select a few deals and mark them won, or group by Stage.')
    const highlightsBigDeals = React.useRef(false)

    const setFeature = (key: string, isOn: boolean) => {
        //grouped by stage while grouping is on
        if (key === 'grouping') {
            provider.grouping.clear()
            if (isOn) {
                provider.grouping.addGroupBy({ alias: 'stage', columnName: 'stage' })
            }
            provider.refresh()
        }
        if (key === 'rowSelection' && !isOn) {
            setSelectedIds([])
        }
        setFeatures(current => ({ ...current, [key]: isOn }))
    }

    const selectedValue = selectedIds.reduce((total, id) => total + Number(provider.getRecordsMap()[id]?.getValue('value') ?? 0), 0)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal wrap tokens={{ childrenGap: '4px 24px' }}>
            {FEATURES.map(feature => <Toggle
                key={feature.key}
                label={feature.label}
                inlineLabel
                checked={features[feature.key]}
                onChange={(_event, checked) => setFeature(feature.key, !!checked)} />)}
        </Stack>
        <MessageBar messageBarType={selectedIds.length ? MessageBarType.success : MessageBarType.info}>
            {selectedIds.length ? selectedIds.length + ' deal(s) selected, worth ' + formatMoney(selectedValue) + '. ' : ''}{status}
        </MessageBar>
        <Grid.Root
            key={JSON.stringify(features)}
            provider={provider}
            modules={{
                rowModel: createServerSideRowModelModule(),
                rowSelection: features.rowSelection ? createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds }) : undefined,
                cellSelection: features.cellSelection ? createCellSelectionModule() : undefined,
                clipboard: features.clipboard ? createClipboardModule() : undefined,
                sorting: features.sorting ? createSortingModule() : undefined,
                filtering: features.filtering ? createFilteringModule() : undefined,
                grouping: features.grouping ? createGroupingModule() : undefined,
                aggregation: features.aggregation ? createAggregationModule() : undefined,
                custom: [closedDealsModule],
            }}
            colDefs={{
                //the deal's name stands for the deal, drawn as a link that opens it
                name: { settings: { isPrimary: true } },
                value: {
                    settings: {
                        cell: {
                            onGetTheme: (theme, { record }) => {
                                if (highlightsBigDeals.current && !isSummaryRow(record) && !isWon(record) && !isLost(record) && Number(record.getValue('value') ?? 0) > 20000) {
                                    theme.colors.background = '#e8ebfa'
                                    theme.colors.text = '#3b3a93'
                                }
                            },
                        },
                        header: {
                            //the header says the highlight is on
                            onGetTheme: theme => {
                                if (highlightsBigDeals.current) {
                                    theme.colors.background = '#e8ebfa'
                                    theme.colors.text = '#3b3a93'
                                }
                            },
                            onGetMenuSections: sections => {
                                sections.push({
                                    key: 'highlight',
                                    title: 'Highlight',
                                    items: [{
                                        key: 'bigDeals',
                                        text: 'Deals over $20,000',
                                        canCheck: true,
                                        checked: highlightsBigDeals.current,
                                        iconProps: { iconName: 'Highlight' },
                                        onClick: () => {
                                            highlightsBigDeals.current = !highlightsBigDeals.current
                                            provider.requestRender()
                                        },
                                    }],
                                })
                            },
                        },
                    },
                },
                closedate: {
                    settings: {
                        cell: {
                            onGetTheme: (theme, { record }) => {
                                if (isOverdue(record)) {
                                    theme.colors.text = '#a4262c'
                                }
                            },
                        },
                        header: {
                            onGetAdornments: adornments => {
                                const overdue = provider.getRecords().filter(isOverdue).length
                                if (overdue > 0) {
                                    adornments.push({ key: 'overdue', placement: 'suffix', title: overdue + ' overdue', onRender: () => <Icon iconName='Clock' style={{ color: '#a4262c' }} /> })
                                }
                            },
                        },
                    },
                },
                //edited where it stands, with no editor to open
                recurring: { settings: { cell: { oneClickEdit: true } } },
                //the provider grows a row to fit long text by default
                notes: { autoHeight: false },
                nextstep: { autoHeight: false },
                actions: {
                    headerName: '', pinned: 'right', initialWidth: 96, sortable: false, valueGetter: () => null,
                    settings: {
                        cell: {
                            onGetCommands: (result, { record }) => {
                                if (isSummaryRow(record) || isWon(record)) {
                                    return
                                }
                                const targets = getTargets(record)
                                const suffix = targets.length > 1 ? ' (' + targets.length + ')' : ''
                                result.items.push({ key: 'won', title: 'Mark as won' + suffix, iconProps: { iconName: 'Trophy2' }, onClick: () => targets.forEach(target => { target.setValue('stage', WON); target.save() }) })
                                result.items.push({ key: 'lost', title: 'Mark as lost' + suffix, iconProps: { iconName: 'Cancel' }, onClick: () => targets.forEach(target => { target.setValue('stage', LOST); target.save() }) })
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
            onAfterRecordSaved={result => setStatus(result.success ? 'Saved.' : 'The save was refused: open the red icon to see why.')}
            height='560px' />
    </Stack>
}
`

const HIDDEN_COLUMNS = ['probability', 'language', 'timezone']

const getOverviewColumn = (column: IColumn): IColumn => {
    switch (column.name) {
        //a deal can be lost as well as won
        case 'stage':
            return { ...column, metadata: { ...column.metadata, OptionSet: [...(column.metadata?.OptionSet ?? []), { Value: 5, Label: 'Lost', Color: '#a4262c' }] } }
        default:
            return column
    }
}

const createOverviewProvider = () => {
    const provider = createDocsProvider()
    //nothing is won or lost yet: closing a deal is what the overview lets you do
    provider.setDataSource(DOCS_ROWS.map(row => row.stage === 4 ? { ...row, stage: 3 } : { ...row }))
    provider.setColumns([...DOCS_COLUMNS, ...DOCS_OVERVIEW_COLUMNS].filter(column => !HIDDEN_COLUMNS.includes(column.name)).map(getOverviewColumn))
    provider.aggregation.addAggregation({ alias: 'value_sum', columnName: 'value', aggregationFunction: 'sum' })
    provider.aggregation.addAggregation({ alias: 'timespent_sum', columnName: 'timespent', aggregationFunction: 'sum' })
    const save = provider.onRecordSave.bind(provider)
    provider.onRecordSave = async record => {
        if (Number(record.getValue('value') ?? 0) <= 30000) {
            return save(record)
        }
        return { recordId: record.getRecordId(), success: false, fields: [], errors: [{ fieldName: 'value', message: 'A deal over $30,000 needs a manager to sign it off.' }] }
    }
    provider.refresh()
    return provider
}

export const OverviewExample = () => <GridExampleRunner seedCode={OVERVIEW_CODE} onCreateProvider={createOverviewProvider} />
