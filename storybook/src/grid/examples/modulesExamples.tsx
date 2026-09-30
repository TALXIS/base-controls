import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'
import { createDocsProvider } from '../gridDocsData'

export const ROW_MODELS_CODE = `const GridExample = () => {
    const [isServerSide, setIsServerSide] = React.useState(false)

    return <Stack tokens={{ childrenGap: 8 }}>
        <Toggle label='Server-side rows' inlineLabel checked={isServerSide} onChange={(_event, checked) => setIsServerSide(!!checked)} />
        <Grid.Root
            key={isServerSide ? 'server' : 'client'}
            provider={provider}
            modules={{
                rowModel: isServerSide ? createServerSideRowModelModule() : createClientSideRowModelModule(),
                grouping: createGroupingModule(),
            }}
            height='440px' />
    </Stack>
}
`

export const SELECTING_ROWS_CODE = `const GridExample = () => {
    const [selectedIds, setSelectedIds] = React.useState<string[]>([])

    return <Stack tokens={{ childrenGap: 8 }}>
        <MessageBar>{selectedIds.length} deal(s) selected</MessageBar>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                rowSelection: createRowSelectionModule({ mode: 'multiple', onSelectionChanged: setSelectedIds }),
            }}
            height='440px' />
    </Stack>
}
`

export const HIGHLIGHTING_CELLS_CODE = `const GridExample = () => <Stack tokens={{ childrenGap: 8 }}>
    <span>Drag across cells to highlight them, then press Ctrl+C and paste into a spreadsheet.</span>
    <Grid.Root
        provider={provider}
        modules={{
            rowModel: createClientSideRowModelModule(),
            cellSelection: createCellSelectionModule({ enableFillHandle: false }),
            clipboard: createClipboardModule({ copyHeadersToClipboard: true }),
        }}
        height='440px' />
</Stack>
`

export const SORTING_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule({
            labels: { sortTextAscending: 'A → Z', sortTextDescending: 'Z → A' },
        }),
    }}
    height='440px' />
`

export const FILTERING_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }}
    height='440px' />
`

export const GROUPING_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createServerSideRowModelModule(),
        grouping: createGroupingModule({
            type: 'nested',
            defaultExpandedLevel: 1,
            pinGroupedColumns: true,
        }),
    }}
    height='440px' />
`

export const TOTALS_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        aggregation: createAggregationModule({ allowUserAggregation: true }),
    }}
    height='440px' />
`

const createGroupedProvider = () => {
    const provider = createDocsProvider()
    provider.grouping.addGroupBy({ alias: 'owner', columnName: 'owner' })
    provider.refresh()
    return provider
}

const createTotalledProvider = () => {
    const provider = createDocsProvider()
    provider.aggregation.addAggregation({ alias: 'value_sum', columnName: 'value', aggregationFunction: 'sum' })
    provider.aggregation.addAggregation({ alias: 'timespent_sum', columnName: 'timespent', aggregationFunction: 'sum' })
    provider.refresh()
    return provider
}

export const RowModelsExample = () => <GridExampleRunner seedCode={ROW_MODELS_CODE} />
export const SelectingRowsExample = () => <GridExampleRunner seedCode={SELECTING_ROWS_CODE} />
export const HighlightingCellsExample = () => <GridExampleRunner seedCode={HIGHLIGHTING_CELLS_CODE} />
export const SortingExample = () => <GridExampleRunner seedCode={SORTING_CODE} />
export const FilteringExample = () => <GridExampleRunner seedCode={FILTERING_CODE} />
export const GroupingExample = () => <GridExampleRunner seedCode={GROUPING_CODE} onCreateProvider={createGroupedProvider} />
export const TotalsExample = () => <GridExampleRunner seedCode={TOTALS_CODE} onCreateProvider={createTotalledProvider} />
