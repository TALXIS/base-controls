import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DriveTheControlExample, WatchTheControlExample } from '../../dataset-control/examples/talkingExamples'

const DESCRIPTION = `
DatasetControl gives your code one object, \`IDatasetControl\`, to talk to it: switch the view, reload it, follow every load, and reach any part on the page, such as the quick find or the column editor.

## Getting the control

Inside the control, any component gets it from \`useDatasetControl()\`:

\`\`\`tsx
const WonDealsButton = () => {
    const control = useDatasetControl()
    return <DefaultButton text='Won deals' onClick={() => control.loadView('won')} />
}
\`\`\`

Outside it, two props hand it to the code that mounts the control, on every mount:

- \`onMounted\` as soon as the control exists, before its load. Subscribe to its events here.
- \`onReady\` once its load succeeded, as the control's \`onLoaded\` event does. A failed load doesn't call it.

\`\`\`tsx
const controlRef = React.useRef<IDatasetControl>()

<DatasetControl onLoad={loadDeals} onMounted={control => controlRef.current = control}>...</DatasetControl>
\`\`\`

## Views and loading

| Member | Description |
|---|---|
| \`loadView(viewId)\` | Loads the view through \`onLoad\`, as picking it in the view switcher does. |
| \`reload()\` | Loads the views and the view shown again, on a new provider. |
| \`retry()\` | Runs the load that failed again. |
| \`getViews()\` | The views as listed for this mount. See [**Views**](?path=/docs/datasetcontrol-views--overview). |
| \`getViewId()\` | The view shown. |
| \`getView()\` | The view shown, as it was resolved, with its columns and \`data\`. |
| \`getProvider()\` | The provider shown. Inside the control, \`useDataProvider()\` returns it too. |
| \`isLoadingView()\` | Whether a view is loading, behind the skeleton. |
| \`getError()\` | What the last load threw, until the next one starts. |

\`loadView()\`, \`reload()\` and \`retry()\` ask the user first when the records have unsaved changes, and do nothing if they cancel. How a load runs is on [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).

## Reach the parts

Every part on the page registers itself on the control, under its own key, for as long as it is rendered. \`control.parts\` finds it:

\`\`\`tsx
const quickFind = control.parts.get('quickFind')
quickFind.setQuery('Contoso')
quickFind.search()
\`\`\`

- \`get(key)\` returns the part, and throws when it isn't rendered.
- \`find(key)\` returns \`undefined\` instead, for a part that may not be there.
- \`whenAvailable(key, callback)\` calls back once the part is rendered.

| Key | Part | Description |
|---|---|---|
| \`viewSwitcher\` | [**Views**](?path=/docs/datasetcontrol-views--overview) | List the views and pick one. |
| \`ribbon\` | [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview) | Load the commands again, see which are running. |
| \`quickFind\` | [**Quick find**](?path=/docs/datasetcontrol-parts-quick-find--overview) | Set the query and search. |
| \`editColumns\` | [**Edit columns**](?path=/docs/datasetcontrol-parts-edit-columns--overview) | Open, save and close the column editor. |
| \`pagination\` | [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview) | Move between the pages. |
| \`pageSizeSwitcher\` | [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview) | Change the page size, read the record range. |
| \`notifications\` | [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview) | Read the provider's load error. |
| \`loadingOverlay\` | — | Cover the whole control with a spinner and a message: \`show(message?)\` returns the function that hides it again. Callers overlap; it stays until all have hidden it. Always there. |

Each part's page lists everything it offers, under *From your code*.

### Parts live as long as a load

Every load mounts the parts anew on the new provider: the first load, a view switch, \`loadView()\`, \`reload()\` and \`retry()\`. While a load runs, the placeholder shows in their place. So:

- \`control.parts.get(...)\` throws while a load runs; use \`find\` where that can happen.
- A listener on a part's \`events\` is gone after the next load: add it again in the control's \`onLoaded\` event.
- \`whenAvailable\` calls back once, for the part as it is then.

{{story: Drive the control from a toolbar}}

## Events

\`control.events\` tells you when loads start, finish and fail. Subscribe in \`onMounted\`, so you don't miss the first load:

\`\`\`tsx
const onMounted = (control: IDatasetControl) => {
    control.events.addEventListener('onLoaded', () => setViewInUrl(control.getViewId()))
}
\`\`\`

| Event | Arguments | When it fires |
|---|---|---|
| \`onLoadStarted\` | None | A load starts: the first one, a view switch, \`loadView()\` or \`reload()\`. |
| \`onLoaded\` | \`provider\` | A load finished, and its provider is now the one shown. |
| \`onLoadFailed\` | \`error\` | A load failed. The provider shown before, if any, stays. |
| \`onDestroyed\` | None | The control is unmounting. |

Each part has \`events\` of its own too, listed on its page. \`removeEventListener\` takes the same function you added.

{{story: Watch the control load}}
`

const meta = {
    title: 'DatasetControl/Talking to the control',
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

export const DriveTheControl: Story = {
    name: 'Drive the control from a toolbar',
    render: () => renderStory(<DriveTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `A toolbar of your own in the footer: it switches and reloads views through the control, and searches and opens the column editor through \`control.parts\`. Try: press each button, then open **Code**.`,
            },
        },
    },
}

export const WatchTheControl: Story = {
    name: 'Watch the control load',
    render: () => renderStory(<WatchTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `The control's events and its \`onMounted\`, \`onReady\` and \`onDestroyed\`, newest first. Try: switch the view, press *Show won deals*, which calls \`loadView('won')\`, then *Remount*.`,
            },
        },
    },
}
