import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const PIPELINE_BY_MANAGER_CODE = `const createPipelineProvider = () => {
    const deals = createDealsProvider()
    deals.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
    deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    deals.aggregation.addAggregation({ columnName: 'probability', alias: 'probability_avg', aggregationFunction: 'avg' })
    deals.setSorting([{ name: 'value', sortDirection: 1 }])
    deals.refresh()
    return deals
}

const GridExample = () => {
    const deals = React.useMemo(createPipelineProvider, [])

    return <Grid.Root
        provider={deals}
        modules={{
            rowModel: createClientSideRowModelModule(),
            sorting: createSortingModule(),
            grouping: createGroupingModule({ defaultExpandedLevel: 0 }),
            aggregation: createAggregationModule(),
        }}
        enableOptionSetColors
        height='480px' />
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

    //the provider regroups by the new type only on its next load
    React.useEffect(() => {
        timesheets.refresh()
    }, [type])

    return <Stack tokens={{ childrenGap: 8 }}>
        <ChoiceGroup
            label='Group the week'
            selectedKey={type}
            options={[{ key: 'nested', text: 'By employee, then by day' }, { key: 'flat', text: 'One group per employee and day' }]}
            onChange={(_, option) => setType(option?.key as GroupingType)}
            styles={{ flexContainer: { display: 'flex', gap: 24 } }} />
        <Grid.Root
            key={type}
            provider={timesheets}
            modules={{
                rowModel: createClientSideRowModelModule(),
                grouping: createGroupingModule({ type, defaultExpandedLevel: 0 }),
                aggregation: createAggregationModule(),
            }}
            enableOptionSetColors
            height='480px' />
    </Stack>
}
`

export const FILTERED_TOTALS_CODE = `const createDealsWithTotals = () => {
    const deals = createDealsProvider()
    deals.aggregation.addAggregation({ columnName: 'name', alias: 'name_countcolumn', aggregationFunction: 'countcolumn' })
    deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
    deals.refresh()
    return deals
}

const GridExample = () => {
    const deals = React.useMemo(createDealsWithTotals, [])

    return <Grid.Root
        provider={deals}
        modules={{
            rowModel: createClientSideRowModelModule(),
            sorting: createSortingModule(),
            filtering: createFilteringModule(),
            aggregation: createAggregationModule(),
        }}
        enableOptionSetColors
        height='440px' />
}
`

export const EXPAND_FROM_TOOLBAR_CODE = `const createReviewProvider = () => {
    const timesheets = createTimesheetsProvider()
    timesheets.grouping.addGroupBy({ columnName: 'status', alias: 'status_group' })
    timesheets.grouping.addGroupBy({ columnName: 'employee', alias: 'employee_group' })
    timesheets.aggregation.addAggregation({ columnName: 'hours', alias: 'hours_sum', aggregationFunction: 'sum' })
    timesheets.refresh()
    return timesheets
}

const GridExample = () => {
    const timesheets = React.useMemo(createReviewProvider, [])
    const runtimeRef = React.useRef<IGridRuntime>()

    const expandTo = (getLevel: (current: number, deepest: number) => number) => {
        const grouping = runtimeRef.current?.services.get('grouping')
        if (grouping) {
            grouping.setExpandedLevel(getLevel(grouping.getExpandedLevel(), grouping.getDeepestLevel()))
        }
    }

    const toolbarItems: ICommandBarItemProps[] = [
        { key: 'collapseAll', text: 'Collapse all', iconProps: { iconName: 'CollapseContent' }, onClick: () => expandTo(() => -1) },
        { key: 'expandLevel', text: 'Expand one level', iconProps: { iconName: 'ChevronDown' }, onClick: () => expandTo(current => current + 1) },
        { key: 'expandAll', text: 'Expand all', iconProps: { iconName: 'ExploreContent' }, onClick: () => expandTo((_, deepest) => deepest) },
    ]

    return <Stack tokens={{ childrenGap: 8 }}>
        <CommandBar items={toolbarItems} />
        <Grid.Root
            provider={timesheets}
            modules={{
                rowModel: createClientSideRowModelModule(),
                grouping: createGroupingModule(),
                aggregation: createAggregationModule(),
            }}
            enableOptionSetColors
            onGridReady={runtime => { runtimeRef.current = runtime }}
            height='440px' />
    </Stack>
}
`

export const PipelineByManagerExample = () => <GridExampleRunner seedCode={PIPELINE_BY_MANAGER_CODE} dataset='deals' />

export const HoursByEmployeeExample = () => <GridExampleRunner seedCode={HOURS_BY_EMPLOYEE_CODE} dataset='timesheets' />

export const FilteredTotalsExample = () => <GridExampleRunner seedCode={FILTERED_TOTALS_CODE} dataset='deals' />

export const ExpandFromToolbarExample = () => <GridExampleRunner seedCode={EXPAND_FROM_TOOLBAR_CODE} dataset='timesheets' />
