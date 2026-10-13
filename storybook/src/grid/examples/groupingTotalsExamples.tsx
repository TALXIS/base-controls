import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const PIPELINE_BY_MANAGER_CODE = `const createPipelineProvider = () => {
    const deals = createDealsProvider()
    deals.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
    deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    deals.aggregation.addAggregation({ columnName: 'probability', alias: 'probability_avg', aggregationFunction: 'avg' })
    deals.setSorting([{ name: 'value', sortDirection: 1 }])
    return deals
}

const GridExample = () => {
    const deals = React.useMemo(createPipelineProvider, [])

    return <DatasetControl onLoad={async () => ({ provider: deals })}>
        <DatasetControl.Body>
            <Grid
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    sorting: createSortingModule(),
                    grouping: createGroupingModule({ defaultExpandedLevel: 0 }),
                    aggregation: createAggregationModule(),
                }}
                enableOptionSetColors
                height='480px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const HOURS_BY_EMPLOYEE_CODE = `type GroupingType = 'nested' | 'flat'

const createWeekProvider = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.grouping.addGroupBy({ columnName: 'employee', alias: 'employee_group' })
    timesheets.grouping.addGroupBy({ columnName: 'date', alias: 'date_group' })
    timesheets.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    timesheets.setSorting([{ name: 'employee', sortDirection: 0 }, { name: 'date', sortDirection: 0 }])
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createWeekProvider, [])
    const [type, setType] = React.useState<GroupingType>('nested')

    const changeType = (next: GroupingType) => {
        setType(next)
        //the provider regroups by the new type only on its next load
        timesheets.refresh()
    }

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <ChoiceGroup
                    label='Group the week'
                    selectedKey={type}
                    options={[{ key: 'nested', text: 'By employee, then by day' }, { key: 'flat', text: 'One group per employee and day' }]}
                    onChange={(_, option) => changeType(option?.key as GroupingType)}
                    styles={{ flexContainer: { display: 'flex', gap: 24 } }} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                key={type}
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    grouping: createGroupingModule({ type, defaultExpandedLevel: 0 }),
                    aggregation: createAggregationModule(),
                }}
                enableOptionSetColors
                height='480px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const FILTERED_TOTALS_CODE = `const createDealsWithTotals = () => {
    const deals = createDealsProvider()
    deals.aggregation.addAggregation({ columnName: 'name', alias: 'name_countcolumn', aggregationFunction: 'countcolumn' })
    deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    return deals
}

const GridExample = () => {
    const deals = React.useMemo(createDealsWithTotals, [])

    return <DatasetControl onLoad={async () => ({ provider: deals })}>
        <DatasetControl.Body>
            <Grid
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    sorting: createSortingModule(),
                    filtering: createFilteringModule(),
                    aggregation: createAggregationModule(),
                }}
                enableOptionSetColors
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const EXPAND_FROM_RIBBON_CODE = `const createReviewProvider = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.grouping.addGroupBy({ columnName: 'status', alias: 'status_group' })
    timesheets.grouping.addGroupBy({ columnName: 'employee', alias: 'employee_group' })
    timesheets.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createReviewProvider, [])
    const gridRef = React.useRef<IGrid>()

    const expandTo = (getLevel: (current: number, deepest: number) => number) => {
        const grouping = gridRef.current?.services.find('grouping')
        if (grouping) {
            grouping.setExpandedLevel(getLevel(grouping.getExpandedLevel(), grouping.getDeepestLevel()))
        }
    }

    const loadCommands = async (): Promise<IRibbonCommand[]> => [
        { id: 'collapseAll', label: 'Collapse all', iconName: 'CollapseContent', onExecute: () => expandTo(() => -1) },
        { id: 'expandLevel', label: 'Expand one level', iconName: 'ChevronDown', onExecute: () => expandTo(current => current + 1) },
        { id: 'expandAll', label: 'Expand all', iconName: 'ExploreContent', onExecute: () => expandTo((_, deepest) => deepest) },
    ]

    return <DatasetControl onLoad={async () => ({ provider: timesheets })}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.Ribbon onLoad={loadCommands} />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid
                modules={{
                    rowModel: createClientSideRowModelModule(),
                    grouping: createGroupingModule(),
                    aggregation: createAggregationModule(),
                }}
                enableOptionSetColors
                onReady={grid => { gridRef.current = grid }}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const PipelineByManagerExample = () => <GridExampleRunner seedCode={PIPELINE_BY_MANAGER_CODE} dataset='deals' />

export const HoursByEmployeeExample = () => <GridExampleRunner seedCode={HOURS_BY_EMPLOYEE_CODE} dataset='timesheets' />

export const FilteredTotalsExample = () => <GridExampleRunner seedCode={FILTERED_TOTALS_CODE} dataset='deals' />

export const ExpandFromRibbonExample = () => <GridExampleRunner seedCode={EXPAND_FROM_RIBBON_CODE} dataset='timesheets' />
