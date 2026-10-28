import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const TRIAGE_QUEUE_CODE = `const GridExample = () => <DatasetControl onLoad={async () => ({ provider: provider })}>
    <DatasetControl.Body>
        <Grid
            modules={[
                createClientSideRowModelModule(),
                createSortingModule(),
                createFilteringModule(),
            ]}
            enableOptionSetColors
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const OPEN_ON_WHAT_MATTERS_CODE = `//the filter callout writes option set values as strings
const RESOLVED = '4'

const createQueueProvider = () => {
    const tickets = createTicketsProvider()
    tickets.setSorting([{ name: 'assignee', sortDirection: 0 }, { name: 'duedate', sortDirection: 0 }])
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
            <Grid
                modules={[
                    createClientSideRowModelModule(),
                    createSortingModule(),
                    createFilteringModule(),
                ]}
                enableOptionSetColors
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const SAVED_VIEWS_CODE = `const RESOLVED = '4'
const IS_OPEN = { attributeName: 'status', conditionOperator: Operators.DoesNotEqual.Value, value: RESOLVED }

interface ISavedView {
    id: string
    name: string
    apply: (tickets: IDataProvider) => void
}

const SAVED_VIEWS: ISavedView[] = [
    {
        id: 'open',
        name: 'Open tickets',
        apply: tickets => {
            tickets.setSorting([{ name: 'duedate', sortDirection: 0 }])
            tickets.setFiltering({ filterOperator: Type.And.Value, conditions: [IS_OPEN] })
        },
    },
    {
        id: 'dueToday',
        name: 'Due today',
        apply: tickets => {
            tickets.setSorting([{ name: 'duedate', sortDirection: 0 }])
            tickets.setFiltering({ filterOperator: Type.And.Value, conditions: [IS_OPEN, { attributeName: 'duedate', conditionOperator: Operators.Today.Value, value: '' }] })
        },
    },
    {
        id: 'oldest',
        name: 'Oldest first',
        apply: tickets => {
            tickets.setSorting([{ name: 'createdon', sortDirection: 0 }])
            tickets.setFiltering({ filterOperator: Type.And.Value, conditions: [IS_OPEN] })
        },
    },
    {
        id: 'everything',
        name: 'Everything',
        apply: () => { },
    },
]

//every view loads a provider of its own, sorted and filtered the way the view says
const loadView = async (parameters: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const view = SAVED_VIEWS.find(view => view.id === parameters.view?.id) ?? SAVED_VIEWS[0]
    const tickets = createTicketsProvider()
    view.apply(tickets)
    return { provider: tickets }
}

//every view shows every ticket column
const TICKET_COLUMNS = createTicketsProvider().getColumns()

const loadViews = async (): Promise<IDatasetControlView[]> => SAVED_VIEWS.map(view => ({ id: view.id, name: view.name, resolve: () => ({ columns: TICKET_COLUMNS }) }))

const GridExample = () => <DatasetControl onLoadViews={loadViews} stateKey='ticket-views' onLoad={loadView}>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid
            modules={[
                createClientSideRowModelModule(),
                createSortingModule(),
                createFilteringModule(),
            ]}
            enableOptionSetColors
            height='440px' />
    </DatasetControl.Body>
</DatasetControl>
`

export const TAILORED_FILTERS_CODE = `//each list keeps the operator its data type's filter opens on
const FILTER_OPERATORS = new Map([
    ['ticketnumber', [Operators.Like.Value, Operators.Equal.Value]],
    ['title', [Operators.Like.Value, Operators.NotLike.Value]],
    ['customer', [Operators.Like.Value, Operators.Equal.Value]],
    ['assignee', [Operators.Like.Value, Operators.DoesNotContainData.Value]],
    ['priority', [Operators.Equal.Value, Operators.DoesNotEqual.Value]],
    ['status', [Operators.Equal.Value, Operators.DoesNotEqual.Value]],
    ['duedate', [Operators.On.Value, Operators.OnOrBefore.Value, Operators.OnOrAfter.Value, Operators.Between.Value, Operators.Today.Value]],
    ['timespent', []],
])

const FILTER_PLACEHOLDERS = new Map([
    ['ticketnumber', 'CAS-01045'],
    ['title', 'A word from the subject'],
    ['customer', 'Part of the company name'],
    ['assignee', 'Part of a name'],
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
    onLoad: grid => {
        grid.modules.get('filtering').registerFilterControlParameters((result, { column, control }) => {
            const placeholder = FILTER_PLACEHOLDERS.get(column.name)
            if (control === 'value' && placeholder) {
                result.Placeholder = { raw: placeholder }
            }
        })
    },
}

const GridExample = () => {
    const tickets = React.useMemo(createQueueProvider, [])

    return <DatasetControl onLoad={async () => ({ provider: tickets })}>
        <DatasetControl.Body>
            <Grid
                modules={[
                    createClientSideRowModelModule(),
                    createSortingModule(),
                    createFilteringModule(),
                    filterPlaceholdersModule,
                ]}
                enableOptionSetColors
                height='440px' />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const TriageQueueExample = () => <GridExampleRunner seedCode={TRIAGE_QUEUE_CODE} dataset='tickets' />

export const OpenOnWhatMattersExample = () => <GridExampleRunner seedCode={OPEN_ON_WHAT_MATTERS_CODE} dataset='tickets' />

export const SavedViewsExample = () => <GridExampleRunner seedCode={SAVED_VIEWS_CODE} dataset='tickets' />

export const TailoredFiltersExample = () => <GridExampleRunner seedCode={TAILORED_FILTERS_CODE} dataset='tickets' />
