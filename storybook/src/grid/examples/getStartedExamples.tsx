import React from 'react'
import { CommandBar, Panel } from '@fluentui/react'
import { DataTypes, IColumn } from '@talxis/client-libraries'
import { Form, IFormApi, MemoryStrategy } from '@talxis/base-controls'
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

//what the Grid features panel above has switched on
interface IOverviewProps {
    features: { [feature: string]: boolean }
}

const GridExample = (props: IOverviewProps) => {
    const { features } = props
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [status, setStatus] = React.useState('Switch features on under Grid features, then try them: edit a value, select a few deals and mark them won, or group by Stage.')
    const highlightsBigDeals = React.useRef(false)
    const gridRef = React.useRef<IGridRuntime>()

    //a selection only counts while the grid can select
    const selectedDeals = features.rowSelection ? selectedIds : []

    const selectedValue = selectedDeals.reduce((total, id) => total + Number(provider.getRecordsMap()[id]?.getValue('value') ?? 0), 0)

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar messageBarType={selectedDeals.length ? MessageBarType.success : MessageBarType.info}>
            {selectedDeals.length ? selectedDeals.length + ' deal(s) selected, worth ' + formatMoney(selectedValue) + '. ' : ''}{status}
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
                                            //the tint is not in the records, so nothing redraws on its own
                                            gridRef.current?.services.get('cells').render()
                                            gridRef.current?.services.get('columns').headers.render()
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
            onGridReady={runtime => { gridRef.current = runtime }}
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

//each one switches a module or a prop; the grid remounts, since both are read when it mounts
const FEATURE_GROUPS = [
    { title: 'Editing', features: [{ key: 'editing', label: 'Editing' }, { key: 'autoSave', label: 'Auto-save' }] },
    { title: 'Selection', features: [{ key: 'rowSelection', label: 'Rows' }, { key: 'cellSelection', label: 'Cells' }, { key: 'clipboard', label: 'Clipboard' }] },
    { title: 'Data', features: [{ key: 'sorting', label: 'Sorting' }, { key: 'filtering', label: 'Filtering' }, { key: 'grouping', label: 'Grouping' }, { key: 'aggregation', label: 'Totals' }] },
    { title: 'Look', features: [{ key: 'optionSetColors', label: 'Option set colours' }, { key: 'zebra', label: 'Zebra rows' }] },
]
const FEATURE_KEYS = FEATURE_GROUPS.flatMap(group => group.features.map(feature => feature.key))
const ALL_OFF: { [feature: string]: boolean } = Object.fromEntries(FEATURE_KEYS.map(key => [key, false]))
const EVERYTHING = 'everything'
const ON_OFF = [{ Value: 0, Label: 'Off', Color: '#605e5c' }, { Value: 1, Label: 'On', Color: '#107c10' }]

//the features, as a record the form edits
const FEATURE_COLUMNS: IColumn[] = [{ key: EVERYTHING, label: 'All features' }, ...FEATURE_GROUPS.flatMap(group => group.features)].map(feature => ({
    name: feature.key,
    displayName: feature.label,
    dataType: DataTypes.TwoOptions,
    metadata: { IsValidForUpdate: true, OptionSet: ON_OFF },
}))

export const OverviewExample = () => {
    const provider = React.useMemo(() => createOverviewProvider(), [])
    const [features, setFeatures] = React.useState(ALL_OFF)
    const [isPanelOpen, setIsPanelOpen] = React.useState(false)
    const featuresRef = React.useRef(features)
    featuresRef.current = features
    const formRef = React.useRef<IFormApi>()

    //read when the form loads, so it opens on what is switched on
    const strategy = React.useMemo(() => new MemoryStrategy({
        onGetColumns: () => FEATURE_COLUMNS,
        onGetData: () => ({ id: 'features', ...featuresRef.current, [EVERYTHING]: FEATURE_KEYS.every(key => featuresRef.current[key]) }),
        onGetMetadata: () => ({ PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'id' }),
    }), [])

    const setFeatureValues = (keys: string[], isOn: boolean) => {
        //grouped by stage while grouping is on
        if (keys.includes('grouping') && featuresRef.current.grouping !== isOn) {
            provider.grouping.clear()
            if (isOn) {
                provider.grouping.addGroupBy({ alias: 'stage', columnName: 'stage' })
            }
            provider.refresh()
        }
        const next = { ...featuresRef.current, ...Object.fromEntries(keys.map(key => [key, isOn])) }
        featuresRef.current = next
        setFeatures(next)
    }

    //set while the form's own fields are brought in line
    const isSyncing = React.useRef(false)

    const onFeatureChanged = (fieldName: string, value: any) => {
        if (isSyncing.current) {
            return
        }
        //the form's toggle hands over '1' or '0'
        const isOn = value === true || String(value) === '1'
        setFeatureValues(fieldName === EVERYTHING ? FEATURE_KEYS : [fieldName], isOn)
        const form = formRef.current
        isSyncing.current = true
        if (fieldName === EVERYTHING) {
            FEATURE_KEYS.forEach(key => form?.getField(key).setValue(isOn))
        }
        else {
            form?.getField(EVERYTHING).setValue(FEATURE_KEYS.every(key => featuresRef.current[key]))
        }
        isSyncing.current = false
    }

    return <>
        <Panel isOpen={isPanelOpen} isLightDismiss headerText='Grid features' onDismiss={() => setIsPanelOpen(false)}>
            <Form.Root strategy={strategy} onFormReady={api => { formRef.current = api }} onFieldValueChanged={onFeatureChanged}>
                <Form.Section label='Everything' layout={{ lg: 1 }}>
                    <Form.Field name={EVERYTHING}><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                </Form.Section>
                {FEATURE_GROUPS.map(group => <Form.Section key={group.title} label={group.title} layout={{ lg: 1 }}>
                    {group.features.map(feature => <Form.Field key={feature.key} name={feature.key}><Form.Cell><Form.Control /></Form.Cell></Form.Field>)}
                </Form.Section>)}
            </Form.Root>
        </Panel>
        <GridExampleRunner
            seedCode={OVERVIEW_CODE}
            onCreateProvider={() => provider}
            previewProps={{ features }}
            renderAbovePreview={() => <CommandBar items={[{ key: 'features', text: 'Grid features', iconProps: { iconName: 'Settings' }, onClick: () => setIsPanelOpen(true) }]} styles={{ root: { padding: 0, marginBottom: 8 } }} />} />
    </>
}
