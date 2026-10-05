import React from 'react'
import { GridExampleRunner } from '../GridExampleRunner'

export const TRIAGE_QUEUE_CODE = `const GridExample = () => <Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }}
    enableOptionSetColors
    height='440px' />
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

    return <Grid.Root
        provider={tickets}
        modules={{
            rowModel: createClientSideRowModelModule(),
            sorting: createSortingModule(),
            filtering: createFilteringModule(),
        }}
        enableOptionSetColors
        height='440px' />
}
`

export const SAVED_VIEWS_CODE = `const RESOLVED = '4'
const IS_OPEN = { attributeName: 'status', conditionOperator: Operators.DoesNotEqual.Value, value: RESOLVED }

interface ISavedView {
    key: string
    text: string
    apply: () => void
}

const SAVED_VIEWS: ISavedView[] = [
    {
        key: 'open',
        text: 'Open tickets',
        apply: () => {
            provider.setSorting([{ name: 'duedate', sortDirection: 0 }])
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [IS_OPEN] })
        },
    },
    {
        key: 'dueToday',
        text: 'Due today',
        apply: () => {
            provider.setSorting([{ name: 'duedate', sortDirection: 0 }])
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [IS_OPEN, { attributeName: 'duedate', conditionOperator: Operators.Today.Value, value: '' }] })
        },
    },
    {
        key: 'oldest',
        text: 'Oldest first',
        apply: () => {
            provider.setSorting([{ name: 'createdon', sortDirection: 0 }])
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [IS_OPEN] })
        },
    },
    {
        key: 'everything',
        text: 'Everything',
        apply: () => {
            provider.setSorting([])
            provider.setFiltering(null)
        },
    },
]

const GridExample = () => {
    const [viewKey, setViewKey] = React.useState(SAVED_VIEWS[0].key)
    const [ticketCount, setTicketCount] = React.useState(provider.getRecords().length)

    const showView = (view: ISavedView) => {
        view.apply()
        provider.refresh()
        setViewKey(view.key)
    }

    React.useEffect(() => showView(SAVED_VIEWS[0]), [])

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal wrap verticalAlign='center' tokens={{ childrenGap: 8 }}>
            {SAVED_VIEWS.map(view => <DefaultButton key={view.key} text={view.text} toggle checked={view.key === viewKey} onClick={() => showView(view)} />)}
            <Text>{ticketCount} tickets</Text>
        </Stack>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                sorting: createSortingModule(),
                filtering: createFilteringModule(),
            }}
            enableOptionSetColors
            onDataLoaded={() => setTicketCount(provider.getRecords().length)}
            height='440px' />
    </Stack>
}
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
    onRegister: runtime => {
        runtime.services.get('filtering').registerFilterControlParametersHook((result, { column, control }) => {
            const placeholder = FILTER_PLACEHOLDERS.get(column.name)
            if (control === 'value' && placeholder) {
                result.Placeholder = { raw: placeholder }
            }
        })
    },
}

const GridExample = () => {
    const tickets = React.useMemo(createQueueProvider, [])

    return <Grid.Root
        provider={tickets}
        modules={{
            rowModel: createClientSideRowModelModule(),
            sorting: createSortingModule(),
            filtering: createFilteringModule(),
            custom: [filterPlaceholdersModule],
        }}
        enableOptionSetColors
        height='440px' />
}
`

export const TriageQueueExample = () => <GridExampleRunner seedCode={TRIAGE_QUEUE_CODE} dataset='tickets' />

export const OpenOnWhatMattersExample = () => <GridExampleRunner seedCode={OPEN_ON_WHAT_MATTERS_CODE} dataset='tickets' />

export const SavedViewsExample = () => <GridExampleRunner seedCode={SAVED_VIEWS_CODE} dataset='tickets' />

export const TailoredFiltersExample = () => <GridExampleRunner seedCode={TAILORED_FILTERS_CODE} dataset='tickets' />
