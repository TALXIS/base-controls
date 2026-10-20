import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ProviderViewsExample } from '../../dataset-control/examples/viewsExamples'
import { UserViewsExample } from '../../dataset-control/examples/userViewsExamples'

const DESCRIPTION = `
\`onLoadViews\` returns the views, \`DatasetControl.ViewSwitcher\` lists them, and picking one loads it through \`onLoad\`.

\`\`\`tsx
interface IDealViewData {
    columns: string[]
    stage?: number
}

const loadViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => [
    { id: 'all', name: 'All deals', data: { columns: ['name', 'owner', 'value'] } },
    { id: 'won', name: 'Won deals', data: { columns: ['name', 'value'], stage: 4 } },
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

## A view

| Field | Type | Description |
|---|---|---|
| \`id\` | \`string\` | Identifies the view. |
| \`name\` | \`string\` | Shown in the view switcher. |
| \`group\` | \`{ id, name }\` | The header it is listed under; views without one go under *System views*. |
| \`data\` | \`TData\` | Whatever \`onLoad\` needs to load the view. |

When \`onLoadViews\` throws, the control shows the error as for a failed load. See [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview).

## Type the views' data

Every view's \`data\` has the same type, \`TData\`, user views included. The control takes it from \`onLoadViews\` and \`onLoad\`, or from \`<DatasetControl<IDealViewData>>\`. Pass it wherever else you read the views:

| Where | How |
|---|---|
| \`onLoad\` | \`(params: IDatasetControlLoadParameters<IDealViewData>)\` |
| Inside the control | \`useDatasetControl<IDealViewData>()\` |
| User views | \`createUserQueriesModule<IDealViewData>({ ... })\`, see *Let users save their own views* below |

## Load what the view describes

\`onLoad\` gets the view to load: the one picked or kept, else the first. Set the provider up from its \`data\`:

\`\`\`tsx
const loadDeals = async (params: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const { columns, stage } = params.view?.data ?? DEFAULT_VIEW
    const provider = createDealsProvider(columns)
    provider.setFiltering(stage ? { filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: \`\${stage}\` }] } : null)
    return { provider }
}
\`\`\`

{{story: Views that set up the provider}}

## Draw a view your own way

A view's \`data\` can also pick how the body draws it, such as a grid or cards. See *Your own collection view* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview).

## Let users save their own views

The user queries module lists the user's own views under *My views*. They come from a provider of yours, one record per view.

\`\`\`tsx
const readViewData = (record: IRecord): IDealViewData => JSON.parse(record.getValue('definition'))

const writeViewData = ({ record, datasetControl }: IUserQueryWriteParameters<IDealViewData>) => {
    record.setValue('definition', JSON.stringify(readDefinition(datasetControl.getProvider()!)))
}

const modules = React.useMemo(() => [createUserQueriesModule<IDealViewData>({ provider: userViews, onReadViewData: readViewData, onWriteViewData: writeViewData })], [])

<DatasetControl modules={modules} onLoadViews={loadViews} onLoad={loadDeals}>
    ...
    <DatasetControl.ViewSwitcher>
        <DatasetControl.UserQueries />
    </DatasetControl.ViewSwitcher>
    ...
</DatasetControl>
\`\`\`

- \`onReadViewData(record)\` turns a user view's record into its \`data\`, so \`onLoad\` loads a user view the same way as any other.
- \`onWriteViewData({ record, datasetControl })\` runs before a view is saved: write onto the record what the control shows. \`record.isNew()\` tells a new view from a changed one.
- The switcher gets *Save changes*, *Save as new view* and *Manage views*.
- A user view that fails to save or delete opens the error dialog. See [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview).

{{story: Save your own views}}

| Parameter | Description |
|---|---|
| \`provider\` | Required. The user's views; *Manage views* shows its columns. |
| \`onReadViewData\` | Required. Reads a user view's \`data\` from its record. |
| \`onWriteViewData\` | Fills in the record before it is saved. Throw to stop the save. |
| \`labels\` | Every string, from the *My views* header to the panel. See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |

### Keep the views in Dataverse

Any provider can hold the views, such as a \`MemoryDataProvider\` as in the example. \`createTalxisUserQueriesModule\` keeps them as \`talxis_userquery\` records of an entity, with each view's data as JSON in \`talxis_layoutjson\`:

\`\`\`tsx
const modules = React.useMemo(() => [
    createTalxisUserQueriesModule<IDealViewData>({
        entityName: 'deal',
        onCaptureViewData: datasetControl => readDefinition(datasetControl.getProvider()!),
    }),
], [])
\`\`\`

| Parameter | Description |
|---|---|
| \`entityName\` | Required. The entity the views are of. |
| \`onCaptureViewData\` | Required. What the control shows right now, saved as the view's data. |
| \`onReadViewData\` | Reads a view's data from its record. Parses \`talxis_layoutjson\` when left out. |
| \`recordId\` | Only the views of this record; only views of no record when left out. |
| \`ownerId\` | Only the views this user owns. |
| \`labels\` | Every string, as for \`createUserQueriesModule\`. |

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

\`control.loadView(viewId)\` loads a view, and \`control.reload()\` lists the views again. \`control.parts.get('viewSwitcher')\` returns the switcher; see [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

| Member | Description |
|---|---|
| \`getViews()\` | The views \`onLoadViews\` returned. |
| \`getCurrentView()\` | The view shown; \`undefined\` when it is not among the views. |
| \`select(viewId)\` | Loads the view, as picking it does; nothing when it is already shown. |
| \`registerItems(hook, priority?)\` | Adds to the switcher's menu: \`hook(items)\` changes the Fluent \`IContextualMenuItem\`s in place each time the menu opens. Returns a function that removes it. |
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
                story: `Three views of the deals, each with its columns, filter and sorting in its \`data\`; *Biggest deals* is listed under *Reports*. Try: switch between them, then double-click a deal, change it and switch again; the control asks before it throws your change away.`,
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
                story: `Two saved views under *My views*. Try: change one and *Save changes*, *Save as new view*, then *Manage views*.`,
            },
        },
    },
}
