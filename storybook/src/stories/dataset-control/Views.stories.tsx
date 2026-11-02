import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ProviderViewsExample } from '../../dataset-control/examples/viewsExamples'
import { UserViewsExample } from '../../dataset-control/examples/userViewsExamples'

const DESCRIPTION = `
A view is a way of looking at the records, such as *All deals* or *Won deals*. \`onLoadViews\` lists them, \`DatasetControl.ViewSwitcher\` shows them, and the one the user picks is loaded through \`onLoad\`.

\`\`\`tsx
const loadViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: [{ name: 'name' }, { name: 'owner' }, { name: 'value' }] }) },
    { id: 'won', name: 'Won deals', resolve: () => ({ columns: [{ name: 'name' }, { name: 'value' }], data: { stage: 4 } }) },
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

## Describe a view

The switcher needs only a view's name. What the view shows is resolved when it opens, so it can be fetched then.

| View field | Description |
|---|---|
| \`id\` | Identifies the view. |
| \`name\` | Shown in the switcher. |
| \`group\` | \`{ id, name }\`, the header it is listed under. Views without one go under *System views*. |
| \`resolve(provider)\` | Required. Returns what the view shows, given the provider it opens on. Can be async. |

| \`resolve\` returns | Default | Description |
|---|---|---|
| \`columns\` | Required | The columns the view shows, in order: each a \`name\` and what it changes of that column. The rest comes from the provider's available columns, the ones Edit columns offers. A column the provider does not offer is used as the view gives it. |
| \`linking\` | The provider's own | The related entities its columns come from, as \`alias.column\`. |
| \`data\` | None | Anything else the view sets up, such as its filter. Its type is the control's \`TData\`. |

## Load the view

\`onLoad\` gets the view as listed. Create the provider, call \`view.resolve(provider)\` and set the provider up from the view's \`data\`. Leave the columns and linking alone: the control sets them after \`onLoad\`, then puts back what the user changed in the view. The full sequence is under *What runs, in order* on [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).

\`\`\`tsx
const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const provider = createDealsProvider()
    const { data = {} } = view ? await view.resolve(provider) : {}
    if (data.stage) {
        provider.setFiltering({ filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: \`\${data.stage}\` }] })
    }
    return { provider }
}
\`\`\`

{{story: Views that set up the provider}}

Switching the view asks first when the records have unsaved changes. Inside the control, \`useDatasetControl<IDealViewData>().getView()\` returns the open view with its \`data\`, for example to draw it as cards instead of a grid: see *Your own collection view* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview).

## Let users save their own views

Add a user queries module and put \`DatasetControl.UserQueries\` in the switcher. The user's views are listed under *My views*, and the switcher gets *Save changes* (while a user view is open), *Save as new view* and *Manage views*.

\`\`\`tsx
const modules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'deals.views' })], [])

const saveViewData = (control: IDatasetControl<IDealViewData>) => control.modules.observe('userQueries', userQueries => {
    userQueries.saveWithView('sorting', () => control.getProvider()!.getSorting())
})

<DatasetControl modules={modules} onLoadViews={loadViews} onLoad={loadDeals} onMounted={saveViewData}>
    ...
    <DatasetControl.ViewSwitcher>
        <DatasetControl.UserQueries />
    </DatasetControl.ViewSwitcher>
    ...
</DatasetControl>
\`\`\`

A user view opens like any other, so \`onLoad\` needs nothing new. What it keeps:

| | Saved | Opened |
|---|---|---|
| Columns | Every column, hidden ones too: its name, order, width, visibility, grouping and aggregation, and the links its related columns come through. | Completed from the provider's available columns, as above. |
| Data | What each \`saveWithView(key, getter)\` returns, under its key. A getter that returns \`undefined\` saves nothing; one that throws stops the save. | Comes back as \`data\` from \`view.resolve(provider)\`. |

\`saveWithView\` belongs to the module of one mount, so register it in \`onMounted\` through \`control.modules.observe\`, or from a module of your own. It returns its unregistration. See *Modules* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

{{story: Save your own views}}

## Where user views are kept

| Factory | Keeps the views |
|---|---|
| \`createLocalStorageUserQueriesModule({ storageKey })\` | In this browser, under \`storageKey\`. |
| \`createTalxisUserQueriesModule({ entityName })\` | As \`talxis_userquery\` records. |
| \`createDataverseUserQueriesModule({ entityName, table })\` | As records of a Dataverse table you map. |
| \`createUserQueriesModule({ onCreateStore })\` | In a store of yours. |

Every factory also takes \`enableSaveAsNewView\`, \`enableSaveChanges\` and \`enableManageViews\`. Each command is on unless set to \`false\`. Its strings are \`userQueries.*\` labels: see [**Localization**](?path=/docs/localization--overview).

### Dataverse

\`\`\`tsx
createTalxisUserQueriesModule<IDealViewData>({ entityName: 'deal' })

createDataverseUserQueriesModule<IDealViewData>({
    entityName: 'deal',
    table: { name: 'new_savedview', fieldMapping: { name: 'new_name', layout: 'new_layout', returnedTypeCode: 'new_entity' } },
})
\`\`\`

| Parameter | Description |
|---|---|
| \`entityName\` | Required. The entity the views are of. |
| \`table\` | Required for \`createDataverseUserQueriesModule\`: the table's name, and which of its columns hold the view's \`name\`, \`layout\` and entity (\`returnedTypeCode\`). Optionally a \`description\`, shown in *Manage views*, and a \`recordId\`. |
| \`recordId\` | Only the views of this record; without it, only views of no record. Needs \`recordId\` mapped on the table. |
| \`ownerId\` | Only the views this user owns. |

The switcher fetches only the views' names. A view's layout is fetched when it opens.

### Your own store

\`\`\`tsx
const store: IUserQueriesStore<IDealViewData> = {
    getViews: async () => await api.get('/views'),
    getView: async viewId => await api.get(\`/views/\${viewId}/layout\`),
    createView: async (name, view) => (await api.post('/views', { name, layout: view })).id,
    updateView: async (viewId, view) => { await api.put(\`/views/\${viewId}/layout\`, view) },
    createManageProvider: () => createSavedViewsProvider(),
}

createUserQueriesModule<IDealViewData>({ onCreateStore: () => store })
\`\`\`

| Store member | Description |
|---|---|
| \`getViews()\` | The views to list, as \`{ id, name }\`. |
| \`getView(viewId)\` | The saved view: \`{ columns, linking, data }\`. |
| \`createView(name, view)\` | Saves a new view and returns its id. The control then opens it. |
| \`updateView(viewId, view)\` | Saves the view again. |
| \`createManageProvider()\` | A provider with one record per view, which *Manage views* renames and deletes in. Closing *Manage views* loads the control again. |

\`onCreateStore\` gets the control, so a store can read \`control.getDependencies()\`. \`LocalStorageUserQueriesStore\` and \`DataverseUserQueriesStore\` are exported, to extend.

## ViewSwitcher props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`IViewSwitcherComponents\` | Defaults | See [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |
| \`children\` | \`ReactNode\` | None | What adds to the switcher, such as \`DatasetControl.UserQueries\`. |

## From your code

| On the control | Description |
|---|---|
| \`loadView(viewId)\` | Opens the view, as picking it does. |
| \`reload()\` | Lists the views and opens the current one again. |
| \`getViews()\` | The views as listed for this mount, user views included. |
| \`getView()\` | The open view, with what \`resolve\` returned. |

| On \`control.parts.get('viewSwitcher')\` | Description |
|---|---|
| \`getViews()\`, \`getCurrentView()\` | The views, and the open one as listed; \`undefined\` when it is not among them. |
| \`select(viewId)\` | Opens the view; nothing when it is already open. |
| \`registerItems(hook, priority?)\` | Adds to the switcher's menu: \`hook(items)\` changes the Fluent \`IContextualMenuItem\`s in place each time the menu opens. Returns its unregistration. |

| On \`control.modules.get('userQueries')\` | Description |
|---|---|
| \`saveWithView(key, getter)\` | Saves what \`getter\` returns with every user view. Returns its unregistration. |
| \`isUserView(viewId)\` | Whether the view is one of the user's. |
| \`saveAsNew()\`, \`create(name)\` | Saves what the control shows as a new view, asking for a name or under \`name\`, and opens it. |
| \`save()\` | Saves what the control shows into the open user view. |
| \`events\` | \`onManageRequested\`, \`onOperationFailed(error)\`. |

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
                story: `Views kept in this browser. Try: sort or search, change the columns, *Save as new view*, reload the page, then *Save changes* and *Manage views*. The sorting, filter and search are saved through \`saveWithView\` in *views.ts*.`,
            },
        },
    },
}
