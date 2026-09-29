import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsProvider } from '../gridDocsData'

export const OVERVIEW_CODE = `const WON = 4

const isOverdue = (record: IRecord) => {
    const closeDate = record.getValue('closedate')
    return !!closeDate && Number(record.getValue('stage')) !== WON && new Date(closeDate) < new Date()
}

const GridExample = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])
    const [status, setStatus] = React.useState('Edit a value, group by a column, or select a few deals.')

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
                { colId: 'stage', pinned: 'right' },
                {
                    colId: 'closedate',
                    settings: {
                        onGetTheme: (theme, { record }) => {
                            if (isOverdue(record)) {
                                theme.colors.background = '#fde7e9'
                                theme.colors.text = '#a4262c'
                            }
                        },
                    },
                },
                {
                    colId: 'actions', headerName: '', pinned: 'right', initialWidth: 96, sortable: false, valueGetter: () => null,
                    settings: {
                        onGetCommands: record => ({
                            items: [
                                { key: 'won', title: 'Mark as won', iconProps: { iconName: 'CheckMark' }, onClick: () => record.setValue('stage', WON) },
                                { key: 'reset', title: 'Reset probability', iconProps: { iconName: 'Undo' }, onClick: () => record.setValue('probability', 0) },
                            ],
                        }),
                    },
                },
            ]}
            enableEditing
            enableAutoSave
            onAfterRecordSaved={result => setStatus(result.success ? 'Saved.' : 'The save failed.')}
            height='520px' />
    </Stack>
}
`

const createOverviewProvider = () => {
    const provider = createDocsProvider()
    provider.aggregation.addAggregation({ alias: 'value', columnName: 'value', aggregationFunction: 'sum' })
    provider.aggregation.addAggregation({ alias: 'timespent', columnName: 'timespent', aggregationFunction: 'sum' })
    provider.refresh()
    return provider
}

export const OverviewExample = () => <GridExampleRunner seedCode={OVERVIEW_CODE} onCreateProvider={createOverviewProvider} />
