import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const TRIAGE_QUEUE_CODE = `const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <ClientSideGrid
            modules={[
                createSortingModule(),
                createFilteringModule(),
            ]}
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const OPEN_ON_WHAT_MATTERS_CODE = `//the filter callout writes option set values as strings
const RESOLVED = '4'

//the grid opens with this sort and filter
const createQueueProvider = () => {
    const tickets = createTicketsProvider()
    tickets.setSorting([{ name: 'assignee', sortDirection: 0 }])
    tickets.setFiltering({
        filterOperator: Type.And.Value,
        conditions: [{ attributeName: 'status', conditionOperator: Operators.DoesNotEqual.Value, value: RESOLVED }],
    })
    return tickets
}

const GridExample = () => {
    const tickets = React.useMemo(createQueueProvider, [])

    return <DatasetControl onLoad={async () => ({ provider: tickets })}>
        <DatasetControl.Body>
            <ClientSideGrid
                modules={[
                    createSortingModule(),
                    createFilteringModule(),
                ]}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const TAILORED_FILTERS_CODE = `//each list keeps the operator its data type's filter opens on
const FILTER_OPERATORS = new Map([
    ['title', [Operators.Like.Value, Operators.NotLike.Value]],
    ['status', [Operators.Equal.Value, Operators.DoesNotEqual.Value]],
    ['duedate', [Operators.On.Value, Operators.OnOrBefore.Value, Operators.Today.Value]],
    //no operators: the column cannot be filtered
    ['timespent', []],
])

const createQueueProvider = () => {
    const tickets = createTicketsProvider()
    tickets.setColumns(tickets.getColumns().map(column => {
        const operators = FILTER_OPERATORS.get(column.name)
        return operators ? { ...column, metadata: { ...column.metadata, SupportedFilterConditionOperators: operators } } : column
    }))
    return tickets
}

const filterPlaceholdersModule: IGridModule = {
    name: 'filterPlaceholders',
    //after the filtering module, which it reads as it loads
    priority: 1,
    onLoad: grid => {
        grid.modules.get('filtering').hooks.filterControlParameters.add((result, { column, control }) => {
            if (column.name === 'title' && control === 'value') {
                result.Placeholder = { raw: 'A word from the subject' }
            }
        })
    },
}

const GridExample = () => {
    const tickets = React.useMemo(createQueueProvider, [])

    return <DatasetControl onLoad={async () => ({ provider: tickets })}>
        <DatasetControl.Body>
            <ClientSideGrid
                modules={[
                    createFilteringModule(),
                    filterPlaceholdersModule,
                ]}
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const TriageQueueExample = () => <GridExampleRunner seedCode={TRIAGE_QUEUE_CODE} dataset='tickets' />

export const OpenOnWhatMattersExample = () => <GridExampleRunner seedCode={OPEN_ON_WHAT_MATTERS_CODE} tabs={['preview', 'code']} />

export const TailoredFiltersExample = () => <GridExampleRunner seedCode={TAILORED_FILTERS_CODE} tabs={['preview', 'code']} />
