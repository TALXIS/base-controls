import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { OwnStoreExample, UserViewsExample } from '../../dataset-control/examples/userViewsExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
User views let each user keep a view the way they sorted, filtered and arranged it: they save it as a view of their own, listed under *My views* in the view switcher, and open it later like any other. Add a user queries module to the control and put \`DatasetControl.UserQueries\` in the view switcher, which then offers **Save as new view**, **Save changes** and **Manage views**. Try it below: sort a column, then pick **Save as new view**.

{{canvas: Save your own views}}

## What a view keeps

- **Columns:** every column, hidden ones too, with its order, width, visibility, grouping and aggregation, and the links its related columns come through. On opening, they are completed from the provider's available columns, as for any view.
- **Data:** what each \`saveWithView\` getter returns, under its key. It comes back as \`data\` from \`view.resolve(provider)\`, so \`onLoad\` needs nothing new: see [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

## Save more with a view

\`control.modules.get('userQueries').saveWithView(key, getter)\` saves what \`getter\` returns with every user view. Register it in \`onMounted\`, since each mount loads the module anew, as \`saveDealViewData\` in the example's \`views.ts\` does.

- \`sorting\`, \`filtering\` and \`searchQuery\` are declared keys; declare a key of your own on \`IUserQuerySavedValueMap\`, as the example's \`types.ts\` does.
- \`saveWithView\` returns its unregistration, and registering the same key twice throws.
- A getter that returns \`undefined\` saves nothing; one that throws stops the save.

## Where views are kept

| Factory | Keeps the views |
|---|---|
| \`createLocalStorageUserQueriesModule({ storageKey })\` | In this browser, under \`storageKey\`. |
| \`createTalxisUserQueriesModule({ entityName })\` | As \`talxis_userquery\` records. |
| \`createDataverseUserQueriesModule({ entityName, table })\` | As records of a Dataverse table you map. |
| \`createUserQueriesModule({ onCreateStore })\` | In a store of yours. |

Every factory also takes \`enableSaveAsNewView\`, \`enableSaveChanges\` and \`enableManageViews\`; each command is on unless set to \`false\`.

## Keep views in Dataverse

The example's \`dataverse.ts\` creates both Dataverse modules.

- Both need a page that can reach Dataverse, such as a model-driven app: the views are read and written through \`Xrm.WebApi\`, and *Manage views* lists them with a \`FetchXmlDataProvider\`.
- The switcher fetches only the views' names; a view's layout is fetched when it opens.

## Keep views in your own store

\`createUserQueriesModule({ onCreateStore })\` keeps the views in a store of yours. \`onCreateStore\` gets the control, so the store can read \`control.getDependencies()\`.

{{story: Keep views in your own store}}

| Store member | Description |
|---|---|
| \`getViews()\` | The views to list, as \`{ id, name }\`. |
| \`getView(viewId)\` | The saved view: \`{ columns, linking, data }\`. |
| \`createView(name, view)\` | Saves a new view and returns its id. The control then opens it. |
| \`updateView(viewId, view)\` | Saves the view again. |
| \`createManageProvider()\` | The provider *Manage views* edits the views in. |

What \`createManageProvider()\` returns:

- One record per view, its id the view's id as the primary id.
- A \`name\` column, and optionally a description; *Manage views* shows its columns in an editable grid.
- Renames reach the provider's \`onRecordSave\` and deletions its \`onRecordsDelete\`, so pass both on to your store.
- A \`MemoryDataProvider\` is the usual base, as \`LocalStorageUserQueriesProvider\` is.

\`LocalStorageUserQueriesStore\` and \`DataverseUserQueriesStore\` are exported, to extend.

## Good to know

- \`DatasetControl.UserQueries\` throws without a user queries module.
- Closing *Manage views* loads the control again, so the switcher lists the views as they are now.
- A failed save or delete opens the error dialog: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).
- The commands' strings are \`userQueries.*\` labels: see [**Localization**](?path=/docs/concepts-localization--overview).

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
| \`isUserView(viewId)\` | Whether the view is one of the user's. |
| \`saveAsNew()\`, \`create(name)\` | Saves what the control shows as a new view, asking for a name or under \`name\`, and opens it. |
| \`save()\` | Saves what the control shows into the open user view. |
| \`events\` | \`onManageRequested\`, \`onOperationFailed(error)\`. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'The views you list, and how onLoad sets each one up.' },
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
                story: `A store of your own, logging each call the control makes to it. Try: sort a column and pick **Save as new view**.`,
            },
        },
    },
}
