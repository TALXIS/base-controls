import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { OwnStoreExample, UserViewsExample } from '../../dataset-control/examples/userViewsExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
User views let each user keep a view the way they sorted, filtered and arranged it: they save it as a view of their own, listed under *My views* in the view switcher, and open it later like any other. A user queries module adds **Save as new view**, **Save changes** and **Manage views** to the view switcher, and \`DatasetControl.UserQueries\` in the switcher draws the *Manage views* panel. Try it below: sort a column, then pick **Save as new view**.

{{canvas: Save your own views}}

## What a view keeps

A user view keeps every column, hidden ones too, with its order, width, visibility, grouping and aggregation, and the links its related columns come through. On opening, the columns are completed from the provider's available columns, as for any view.

It also keeps what each \`saveWithView\` getter returns, under its key. As the view opens, each applier puts its value back on the provider, and all of them come back as the view's \`data\`: see [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

## Save more with a view

\`control.modules.get('userQueries').saveWithView(key, getter, applier?)\` saves what \`getter\` returns with every user view. \`applier(value, provider)\` puts the saved value back as a user view opens, before its first page, such as \`provider.setSorting(sorting)\`; leave it out for a value your own UI reads from \`getView().data\`. Call it in \`onSetup\`, since each mount loads the module anew, as \`saveDealViewData\` in the example's \`views.ts\` does.

Declare each key you save on \`IUserQuerySavedValueMap\` in \`declare module '@talxis/base-controls'\`, as the example's \`views.ts\` does for sorting, filtering and search. A getter that returns \`undefined\` saves nothing, and one that throws stops the save. \`saveWithView\` returns its remover, and a second call for the same key throws.

## Where views are kept

| Factory | Keeps the views |
|---|---|
| \`createLocalStorageUserQueriesModule({ storageKey })\` | In this browser, under \`storageKey\`. |
| \`createTalxisUserQueriesModule({ entityName })\` | As \`talxis_userquery\` records. |
| \`createDataverseUserQueriesModule({ entityName, table })\` | As records of a Dataverse table you map. |
| \`createUserQueriesModule({ createStore })\` | In a store of yours. |

Every factory also takes \`enableSaveAsNewView\`, \`enableSaveChanges\` and \`enableManageViews\`; each command is on unless set to \`false\`.

## Keep views in Dataverse

The example's \`dataverse.ts\` creates both Dataverse modules. Both need a page that can reach Dataverse, such as a model-driven app: the views are read and written through \`Xrm.WebApi\`, and *Manage views* lists them with a \`FetchXmlDataProvider\`. The switcher fetches only the views' names; a view's layout is fetched when it opens.

## Keep views in your own store

\`createUserQueriesModule({ createStore })\` keeps the views in a store of yours. \`createStore\` gets the control on every mount.

{{story: Keep views in your own store}}

| Store member | Description |
|---|---|
| \`getViews()\` | The views to list, as \`{ id, name }\`. |
| \`getView(viewId)\` | The saved view: \`{ columns, linking, data }\`. |
| \`createView(name, view)\` | Saves a new view and returns its id. The control then opens it. |
| \`updateView(viewId, view)\` | Saves the view again. |
| \`createManageProvider()\` | The provider *Manage views* edits the views in. |

\`createManageProvider()\` returns one record per view, with the view's id as its primary id and a \`name\` column, as \`ManageViewsProvider\` in the example does on a \`MemoryDataProvider\`. *Manage views* shows its columns in an editable grid, with **Save** and **Delete** in its ribbon: a rename reaches the provider's \`onRecordSave\` and a delete its \`onRecordsDelete\`, so pass both on to your store.

\`LocalStorageUserQueriesStore\` and \`DataverseUserQueriesStore\` are exported, to extend, as the example on [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview) extends the first.

## Good to know

- \`DatasetControl.UserQueries\` throws without a user queries module, and without it **Manage views** opens nothing.
- Closing *Manage views* loads the control again, so the switcher lists the views as they are now.
- A failed save or delete opens the error dialog: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).
- To change the commands' labels, see [**Localization**](?path=/docs/concepts-localization--overview).

## Reference

### Dataverse parameters

| Parameter | Description |
|---|---|
| \`entityName\` | Required. The entity the views are of. |
| \`table\` | Required for \`createDataverseUserQueriesModule\`: the table's name and its \`fieldMapping\`. |
| \`table.fieldMapping\` | The columns holding the view's \`name\`, \`layout\` and entity (\`returnedTypeCode\`); optionally \`description\` and \`recordId\`. |
| \`recordId\` | Only the views of this record; without it, only views of no record. Needs \`recordId\` mapped. |
| \`ownerId\` | Only the views this user owns; without it, every view the user can read. |

### The module from your code

\`control.modules.get('userQueries')\` returns the module (see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)):

| Member | Description |
|---|---|
| \`saveWithView(key, getter, applier?)\` | Saves a value of your own with every user view: see *Save more with a view*. |
| \`getManageProvider()\` | The provider *Manage views* edits the views in, from the store's \`createManageProvider()\`. |
| \`deleteViews(viewIds)\` | Deletes the views through that provider; a failure raises \`onOperationFailed\`. |
| \`events\` | \`onManageRequested\` when the user picks **Manage views**, \`onOperationFailed(error)\` when a save or delete fails. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'The views you list, and how each one sets the provider up.' },
    { title: 'State', iconName: 'History', href: '?path=/docs/controls-datasetcontrol-state--overview', text: 'What each view keeps between switches without being saved.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'What the user sees when saving a view fails.' },
]

const meta = {
    title: 'Controls/DatasetControl/Views/User views',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const SaveYourOwnViews: Story = {
    name: 'Save your own views',
    render: () => renderStory(<UserViewsExample />),
}

export const KeepViewsInYourOwnStore: Story = {
    name: 'Keep views in your own store',
    render: () => renderStory(<OwnStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store of your own, logging each call the control makes to it. Try: pick **Save as new view** and name the view.`,
            },
        },
    },
}
