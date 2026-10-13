import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const DRIVE_THE_GRID_CODE = `const createReviewProvider = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.grouping.addGroupBy({ columnName: 'status', alias: 'status_group' })
    timesheets.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createReviewProvider, [])
    const gridRef = React.useRef<IGrid>()
    const [summary, setSummary] = React.useState('')

    const summarize = () => {
        const sorting = timesheets.getSorting()[0]
        setSummary(\`\${timesheets.getRecords().length} groups\${sorting ? \`, sorted by \${sorting.name}\` : ''}\`)
    }

    const onReady = (grid: IGrid) => {
        gridRef.current = grid
        grid.events.addEventListener('onDataLoaded', summarize)
        summarize()
    }

    const expandAll = () => {
        const grouping = gridRef.current?.services.find('grouping')
        grouping?.setExpandedLevel(grouping.getDeepestLevel())
    }

    const collapseAll = () => gridRef.current?.services.find('grouping')?.setExpandedLevel(-1)

    const sortByHours = () => gridRef.current?.services.find('sorting')?.sortColumn('hours', true)

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'expandAll', label: 'Expand all', iconName: 'ExploreContent', onExecute: expandAll },
        { id: 'collapseAll', label: 'Collapse all', iconName: 'CollapseContent', onExecute: collapseAll },
        { id: 'sortByHours', label: 'Most hours first', iconName: 'SortDown', onExecute: sortByHours },
    ]

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <Text>{summary}</Text>
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    sorting: createSortingModule(),
                    grouping: createGroupingModule(),
                    aggregation: createAggregationModule(),
                }}
                enableOptionSetColors
                onReady={onReady}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const DriveTheGridExample = () => <GridExampleRunner seedCode={DRIVE_THE_GRID_CODE} dataset='timesheets' />
