import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { OwnStoreExample, UserViewsExample } from '../../dataset-control/examples/userViewsExamples'

const DESCRIPTION = `
The views you list are the same for every user, yet each user sorts, filters and arranges the columns their own way. User views let them keep that: they save what the control shows as a view of their own, listed under *My views* in the view switcher, and open it later like any other view.

{{story: Save your own views}}

To offer them, add a user queries module from *Where views are kept* below and put \`DatasetControl.UserQueries\` in the view switcher. The switcher then gets *Save changes* (while a user view is open), *Save as new view* and *Manage views*. A user view opens like any other, so \`onLoad\` needs nothing new: see [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

## What a view keeps

| | Saved | Opened |
|---|---|---|
| Columns | Every column, hidden ones too: name, order, width, visibility, grouping and aggregation, and the links its related columns come through. | Completed from the provider's available columns, as for any view. |
| Data | What each \`saveWithView\` getter returns, under its key. | Comes back as \`data\` from \`view.resolve(provider)\`. |

## Save more with a view

\`saveWithView(key, getter)\` saves what \`getter\` returns with every user view. Register it in \`onMounted\`, since each mount loads the module anew, as \`saveDealViewData\` in the example's *views.ts* does.

Some keys are declared already, such as \`sorting\`, \`filtering\` and \`searchQuery\`. Declare a key of your own on \`IUserQuerySavedValueMap\`:

\`\`\`ts
declare module '@talxis/base-controls' {
    interface IUserQuerySavedValueMap {
        layout: string
    }
}
\`\`\`

- \`saveWithView\` returns its unregistration.
- Registering the same key twice throws.
- A getter that returns \`undefined\` saves nothing; one that throws stops the save.

## Where views are kept

| Factory | Keeps the views |
|---|---|
| \`createLocalStorageUserQueriesModule({ storageKey })\` | In this browser, under \`storageKey\`. |
| \`createTalxisUserQueriesModule({ entityName })\` | As \`talxis_userquery\` records. |
| \`createDataverseUserQueriesModule({ entityName, table })\` | As records of a Dataverse table you map. |
| \`createUserQueriesModule({ onCreateStore })\` | In a store of yours. |

Every factory also takes \`enableSaveAsNewView\`, \`enableSaveChanges\` and \`enableManageViews\`; each command is on unless set to \`false\`.

## Dataverse

\`\`\`tsx
createTalxisUserQueriesModule<IDealViewData>({ entityName: 'deal', ownerId: context.userSettings.userId })

createDataverseUserQueriesModule<IDealViewData>({
    entityName: 'deal',
    ownerId: context.userSettings.userId,
    table: { name: 'new_savedview', fieldMapping: { name: 'new_name', layout: 'new_layout', returnedTypeCode: 'new_entity' } },
})
\`\`\`

| Parameter | Description |
|---|---|
| \`entityName\` | Required. The entity the views are of. |
| \`table\` | Required for \`createDataverseUserQueriesModule\`: the table's name, and which of its columns hold the view's \`name\`, \`layout\` and entity (\`returnedTypeCode\`). Optionally a \`description\`, shown in *Manage views*, and a \`recordId\`. |
| \`recordId\` | Only the views of this record; without it, only views of no record. Needs \`recordId\` mapped on the table. |
| \`ownerId\` | Only the views this user owns. Without it, every view the user can read is listed. |

- Both need a page that can reach Dataverse, such as a model-driven app: the views are read and written through \`Xrm.WebApi\`, and *Manage views* lists them with a \`FetchXmlDataProvider\`.
- The switcher fetches only the views' names. A view's layout is fetched when it opens.

## Your own store

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

\`onCreateStore\` gets the control, so a store can read \`control.getDependencies()\`. \`LocalStorageUserQueriesStore\` and \`DataverseUserQueriesStore\` are exported, to extend.

## From your code

| On \`control.modules.get('userQueries')\` | Description |
|---|---|
| \`saveWithView(key, getter)\` | Saves what \`getter\` returns with every user view. Returns its unregistration. |
| \`isUserView(viewId)\` | Whether the view is one of the user's. |
| \`saveAsNew()\`, \`create(name)\` | Saves what the control shows as a new view, asking for a name or under \`name\`, and opens it. |
| \`save()\` | Saves what the control shows into the open user view. |
| \`events\` | \`onManageRequested\`, \`onOperationFailed(error)\`. |

See *Modules* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## Good to know

- \`DatasetControl.UserQueries\` throws without a user queries module.
- Closing *Manage views* loads the control again, so the switcher lists the views as they are now.
- A failed save or delete opens the error dialog: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).
- The commands' strings are \`userQueries.*\` labels: see [**Localization**](?path=/docs/concepts-localization--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Views/User views',
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

export const SaveYourOwnViews: Story = {
    name: 'Save your own views',
    render: () => renderStory(<UserViewsExample />),
    parameters: {
        docs: {
            description: {
                story: `Views kept in this browser, with their sorting, filter and search saved through \`saveWithView\` in *views.ts*. Try: sort or search, change the columns, *Save as new view*, reload the page, then *Save changes* and *Manage views*.`,
            },
        },
    },
}

export const KeepViewsInYourOwnStore: Story = {
    name: 'Keep views in your own store',
    render: () => renderStory(<OwnStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A store of your own, logging each call the control makes to it. Try: sort a column and pick *Save as new view*, switch views and come back, then rename or delete it in *Manage views*.`,
            },
        },
    },
}
