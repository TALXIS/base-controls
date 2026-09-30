import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsProvider } from '../gridDocsData'

export const OVERVIEW_CODE = `const WON = 4

const isGroupRow = (record: IRecord) => record.getDataProvider().getSummarizationType() === 'grouping'

const isOverdue = (record: IRecord) => {
    const grouping = provider.getColumnsMap()['closedate']?.grouping
    if (grouping?.isGrouped) {
        //a grouped date is drawn in its group row, not in the deals under it
        const closeDate = isGroupRow(record) ? record.getValue(grouping.alias ?? 'closedate') : null
        return !!closeDate && new Date(closeDate) < new Date()
    }
    const closeDate = isGroupRow(record) ? null : record.getValue('closedate')
    return !!closeDate && Number(record.getValue('stage')) !== WON && new Date(closeDate) < new Date()
}

//a deal that is won, or that nobody expects to win any more, is closed
const lockClosedDeals = (result: { isLocked: boolean }, { record }: { record: IRecord }) => {
    //a group row stands for many deals
    if (isGroupRow(record)) {
        return
    }
    if (Number(record.getValue('stage')) === WON || Number(record.getValue('probability') ?? 0) === 0) {
        result.isLocked = true
    }
}

const COPYABLE_WHEN_WON = ['name', 'value']

const copyValue = (columnName: string) => (result: IGridCellCommands, { record }: { record: IRecord }) => {
    if (Number(record.getValue('stage')) !== WON) {
        return
    }
    result.items.push({ key: 'copy', title: 'Copy', iconProps: { iconName: 'Copy' }, onClick: () => { navigator.clipboard.writeText(record.getFormattedValue(columnName) ?? '') } })
}

const isWonBelowMinimum = (record: IRecord) => Number(record.getValue('stage')) === WON && Number(record.getValue('value') ?? 0) < 10000

const validateWonValue = (record: IRecord) => {
    record.expressions.setValidationExpression('value', () => ({ error: isWonBelowMinimum(record), errorMessage: 'A won deal needs a value of at least $10,000.' }))
    record.expressions.setValidationExpression('name', () => ({ error: isWonBelowMinimum(record), errorMessage: 'This deal was won below the $10,000 minimum.' }))
}

const GridExample = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [status, setStatus] = React.useState('Edit a value, group by a column, or select a few deals.')

    React.useEffect(() => {
        provider.getRecords().forEach(validateWonValue)
        provider.addEventListener('onRecordLoaded', validateWonValue)
        return () => provider.removeEventListener('onRecordLoaded', validateWonValue)
    }, [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{selectedIds.length ? selectedIds.length + ' deal(s) selected. ' : ''}{status}</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createServerSideRowModelModule(),
                rowSelection: createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds }),
                cellSelection: createCellSelectionModule(),
                clipboard: createClipboardModule(),
                sorting: createSortingModule(),
                filtering: createFilteringModule(),
                grouping: createGroupingModule(),
                aggregation: createAggregationModule(),
            }}
            colDefs={[
                ...COPYABLE_WHEN_WON.map(colId => ({ colId, settings: { cell: { onGetCommands: copyValue(colId) } } })),
                { colId: 'stage', pinned: 'right' },
                {
                    colId: 'closedate',
                    settings: {
                        cell: {
                            onGetTheme: (theme, { record }) => {
                                if (isOverdue(record)) {
                                    theme.colors.background = '#fde7e9'
                                    theme.colors.text = '#a4262c'
                                }
                            },
                        },
                    },
                },
                {
                    colId: 'actions', headerName: '', pinned: 'right', initialWidth: 96, sortable: false, valueGetter: () => null,
                    settings: {
                        cell: {
                            onGetCommands: (result, { record }) => {
                                //a group row stands for many deals
                                if (isGroupRow(record)) {
                                    return
                                }
                                result.items.push(
                                    { key: 'won', title: 'Mark as won', iconProps: { iconName: 'CheckMark' }, onClick: () => record.setValue('stage', WON) },
                                    { key: 'reset', title: 'Reset probability', iconProps: { iconName: 'Undo' }, onClick: () => record.setValue('probability', 0) },
                                )
                            },
                        },
                    },
                },
            ]}
            enableEditing
            enableAutoSave
            enableOptionSetColors
            rowSettings={{ onGetLock: lockClosedDeals }}
            onAfterRecordSaved={result => setStatus(result.success ? 'Saved.' : 'The save failed.')}
            height='520px' />
    </Stack>
}
`

const createOverviewProvider = () => {
    const provider = createDocsProvider()
    provider.aggregation.addAggregation({ alias: 'value_sum', columnName: 'value', aggregationFunction: 'sum' })
    provider.aggregation.addAggregation({ alias: 'timespent_sum', columnName: 'timespent', aggregationFunction: 'sum' })
    provider.refresh()
    return provider
}

export const OverviewExample = () => <GridExampleRunner seedCode={OVERVIEW_CODE} onCreateProvider={createOverviewProvider} />
