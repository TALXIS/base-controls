import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { WhereViewsAreKeptExample } from '../../../../dataset-control/guide/your-data/whereViewsAreKeptExamples'

const STEP = 'Where views are kept'

const DESCRIPTION = `
{{block: progress}}

So far each salesperson's views have lived in their own browser. This step keeps them where the app keeps its data, in Dataverse or behind your own API, and shows what the control asks of the store that holds them.

{{canvas: Where views are kept}}

## How it works

This step cuts the list of [**Views of their own**](?path=/docs/controls-datasetcontrol-guide-your-data-views-of-their-own--overview) down to its view switcher and grid, and keeps the user's views in a store of its own. In **Code**, the new lines carry \`//new:\`.

Each factory makes the same user queries module over a different store:

| Factory | Keeps the views |
|---|---|
| \`createLocalStorageUserQueriesModule({ storageKey })\` | In this browser, under \`storageKey\` |
| \`createTalxisUserQueriesModule({ entityName })\` | As TALXIS \`talxis_userquery\` records |
| \`createDataverseUserQueriesModule({ entityName, table })\` | As records of a Dataverse table you map in \`table\` |
| \`createUserQueriesModule({ createStore })\` | In a store of your own, as in the example |

Every factory takes the same \`enable…\` flags for the commands. The two Dataverse modules read and write through \`Xrm.WebApi\`, so they run in a model-driven app, as *dataverse.ts* shows: it is not imported, since this page has no Dataverse. They fetch only the views' names for the switcher, and a view's columns when it opens. \`ownerId\` lists one user's views and \`recordId\` one record's; every parameter is on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

### A store of your own

\`createStore\` gets the control of every load and returns the store, which the module calls as the user works:

| The user | The store gets |
|---|---|
| Opens the list, or another view | \`getViews()\` as the load starts, for the views under *My views* |
| Opens one of their own views | \`getView(viewId)\`, for the view as it was saved: \`{ columns, linking, data }\` |
| Picks **Save as new view** | \`createView(name, view)\`, which returns the new view's id; the control then opens it |
| Picks **Save changes** | \`updateView(viewId, view)\` |
| Picks **Manage views** | \`createManageProvider()\`, once per load, for the provider the panel edits the views in |

The manage provider holds one record per view, with the view's id as its primary id and a \`name\` column, as \`ManageViewsProvider\` does over a \`MemoryDataProvider\`. *Manage views* draws it in an editable grid with **Save** and **Delete**: a rename reaches the provider's \`onRecordSave\` and a delete its \`onRecordsDelete\`, so pass both on to your store. \`LocalStorageUserQueriesStore\` and \`DataverseUserQueriesStore\` are exported too, to extend, and every member of a store is under *A user views store* on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

### When the store fails

A store that throws opens the error dialog of [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview), titled *The action could not be completed.*, with the error's message as its details. So does a \`saveWithView\` getter that throws, and a delete the manage provider answers with \`success: false\`; without an \`errorMessage\`, the dialog says *The view could not be deleted.* A store that throws while the control loads fails the load, as on [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview).

## Try it

- Pick **Save as new view** and name the view *Big first*: the log shows \`createView\`, then \`getViews\` and \`getView\` as the control opens it.
- Pick **Manage views**, rename the view and press **Save**: the log shows \`rename\`. Close the panel: the control loads again, with \`getViews\` and \`getView\`.
- Turn on *Server is down* and save another view: the error dialog says *The view could not be saved while the server is down.*

## Remember

- The factory decides where the views are kept; the commands stay the same.
- A store of your own has five members, and its manage provider gets the renames and deletes.
- A store that throws shows the error dialog.

Your list keeps its views and state where your app keeps them. *Advanced* hands it to your code.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Your data/Where views are kept',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WhereViewsAreKept: Story = {
    name: 'Where views are kept',
    tags: ['!dev'],
    render: () => renderStory(<WhereViewsAreKeptExample />),
}
