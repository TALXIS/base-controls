import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ProviderViewsExample } from '../../dataset-control/examples/viewsExamples'
import { UserViewsExample } from '../../dataset-control/examples/userViewsExamples'

const DESCRIPTION = `
A view is a way of looking at the records, such as *All deals* or *Won deals*. You list the views, \`DatasetControl.ViewSwitcher\` shows them, and the one the user picks is loaded through \`onLoad\`.

\`\`\`tsx
const loadViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: [NAME, OWNER, VALUE] }) },
    { id: 'won', name: 'Won deals', resolve: () => ({ columns: [NAME, VALUE], data: { stage: 4 } }) },
]

<DatasetControl onLoadViews={loadViews} onLoad={loadDeals}>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    ...
</DatasetControl>
\`\`\`

## How a view opens

1. \`onLoadViews\` lists the views. The switcher needs only their names.
2. The user picks one, or the control takes the one they left, else the first.
3. The control calls that view's \`resolve\`, and only that one's.
4. \`onLoad\` gets the view with what \`resolve\` returned, and returns a provider for it.
5. The control sets the view's columns on the provider, then puts back what the user changed in that view, such as Edit columns. See [**State**](?path=/docs/datasetcontrol-state--overview).

| View field | Description |
|---|---|
| \`id\` | Identifies the view. |
| \`name\` | Shown in the switcher. |
| \`group\` | \`{ id, name }\`, the header it is listed under. Views without one go under *System views*. |
| \`resolve()\` | Required. Returns what the view shows, below. Can be async, to fetch it as the view opens. |

| \`resolve()\` returns | Description |
|---|---|
| \`columns\` | Required. The columns the view shows, complete and in order. |
| \`linking\` | The related entities its columns come from. |
| \`data\` | Anything else \`onLoad\` needs, such as the view's filter. Its type is the control's \`TData\`. |

If \`onLoadViews\`, \`resolve\` or \`onLoad\` throws, the control shows the error. See [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview).

## Load the view

Read the view's \`data\` in \`onLoad\` and set the provider up with it. Leave the columns alone: the control sets them.

\`\`\`tsx
const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const provider = createDealsProvider()
    if (view?.data?.stage) {
        provider.setFiltering({ filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: \`\${view.data.stage}\` }] })
    }
    return { provider }
}
\`\`\`

{{story: Views that set up the provider}}

Inside the control, \`useDatasetControl<IDealViewData>().getView()\` returns the open view with its \`data\`, for example to draw it as cards instead of a grid. See *Your own collection view* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview).

## Let users save their own views

Add a user queries module and put \`DatasetControl.UserQueries\` in the switcher. The user's views are listed under *My views*, and the switcher gets *Save changes*, *Save as new view* and *Manage views*.

\`\`\`tsx
const modules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({
    storageKey: 'deals.views',
    onGetColumn: name => DEAL_COLUMNS.find(column => column.name === name) ?? null,
    onGetViewData: control => ({ sorting: control.getProvider()?.getSorting() }),
})], [])

<DatasetControl modules={modules} onLoadViews={loadViews} onLoad={loadDeals}>
    ...
    <DatasetControl.ViewSwitcher>
        <DatasetControl.UserQueries />
    </DatasetControl.ViewSwitcher>
    ...
</DatasetControl>
\`\`\`

A user view opens like any other view, so \`onLoad\` needs nothing new. What it keeps:

| | Saved | Opened |
|---|---|---|
| Columns | Each shown column's name, order, width, visibility, grouping and aggregation. | \`onGetColumn(name, linking)\` returns the full column, and the saved layout goes over it. A column it returns \`null\` for is left out. |
| Data | What \`onGetViewData(control)\` returns. Throw to stop the save. | Comes back as \`view.data\` in \`onLoad\`. |

{{story: Save your own views}}

## Where user views are kept

| Factory | Keeps the views | \`onGetColumn\` |
|---|---|---|
| \`createLocalStorageUserQueriesModule\` | In this browser, under \`storageKey\`. | Required. |
| \`createTalxisUserQueriesModule\` | As \`talxis_userquery\` records. | Optional, read from Dataverse by default. |
| \`createDataverseUserQueriesModule\` | As records of a Dataverse table you map. | Optional, read from Dataverse by default. |
| \`createUserQueriesModule\` | In a store of yours. | Required. |

Every factory also takes \`onGetViewData\`, and \`labels\` for its strings; see [**Localization**](?path=/docs/datasetcontrol-localization--overview).

### Dataverse

\`\`\`tsx
createTalxisUserQueriesModule<IDealViewData>({ entityName: 'deal', onGetViewData: captureViewData })

createDataverseUserQueriesModule<IDealViewData>({
    entityName: 'deal',
    table: { name: 'new_savedview', fieldMapping: { name: 'new_name', layout: 'new_layout', returnedTypeCode: 'new_entity' } },
})
\`\`\`

| Parameter | Description |
|---|---|
| \`entityName\` | Required. The entity the views are of. |
| \`table\` | Required for \`createDataverseUserQueriesModule\`: the table's name, and which of its columns hold the view's \`name\`, \`layout\` and entity (\`returnedTypeCode\`). Optionally a \`description\`, shown in *Manage views*, and a \`recordId\`. |
| \`recordId\` | Only the views of this record. Needs \`recordId\` mapped on the table. |
| \`ownerId\` | Only the views this user owns. |

The switcher fetches only the views' names. A view's layout is fetched when it opens.

### Your own store

\`createUserQueriesModule\` keeps the views wherever your store does:

\`\`\`tsx
const store: IUserQueriesStore<IDealViewData> = {
    getViews: async () => await api.get('/views'),
    getView: async viewId => await api.get(\`/views/\${viewId}/layout\`),
    createView: async (name, view) => (await api.post('/views', { name, layout: view })).id,
    updateView: async (viewId, view) => { await api.put(\`/views/\${viewId}/layout\`, view) },
    createManageProvider: () => createSavedViewsProvider(),
}

createUserQueriesModule<IDealViewData>({ store, onGetColumn: getDealColumn, onGetViewData: captureViewData })
\`\`\`

| Store member | Description |
|---|---|
| \`getViews()\` | The views to list, as \`{ id, name }\`. |
| \`getView(viewId)\` | The saved view: \`{ columns, linking, data }\`. |
| \`createView(name, view)\` | Saves a new view and returns its id. |
| \`updateView(viewId, view)\` | Saves the view again. |
| \`createManageProvider()\` | A provider with one record per view, which *Manage views* renames and deletes in. |

## Switching views

- With unsaved changes, the control asks before switching.
- A view comes back as the user left it. See [**State**](?path=/docs/datasetcontrol-state--overview).

## ViewSwitcher props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`labels\` | \`Partial<IViewSwitcherLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IViewSwitcherComponents\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |
| \`children\` | \`ReactNode\` | None | What adds to the switcher, such as \`DatasetControl.UserQueries\`. |

## From your code

| On the control | Description |
|---|---|
| \`loadView(viewId)\` | Opens the view, as picking it does. |
| \`reload()\` | Lists the views and opens the current one again. |
| \`getViews()\` | The views as listed. |
| \`getView()\` | The open view, with what \`resolve\` returned. |

| On \`control.parts.get('viewSwitcher')\` | Description |
|---|---|
| \`getCurrentView()\` | The open view as listed; \`undefined\` when it is not among the views. |
| \`select(viewId)\` | Opens the view; nothing when it is already open. |
| \`registerItems(hook, priority?)\` | Adds to the switcher's menu: \`hook(items)\` changes the Fluent \`IContextualMenuItem\`s in place each time the menu opens. Returns a function that removes it. |

See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).
`

const meta = {
    title: 'DatasetControl/Views',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ViewsThatSetUpTheProvider: Story = {
    name: 'Views that set up the provider',
    render: () => renderStory(<ProviderViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Three views of the deals, each with its columns and, in its \`data\`, its filter or sorting; *Biggest deals* is listed under *Reports*. Try: switch between them, then double-click a deal, change it and switch again; the control asks before it throws your change away.`,
            },
        },
    },
}

export const SaveYourOwnViews: Story = {
    name: 'Save your own views',
    render: () => renderStory(<UserViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Views kept in this browser. Try: change the columns or the sorting, *Save as new view*, reload the page, then *Save changes* and *Manage views*.`,
            },
        },
    },
}
