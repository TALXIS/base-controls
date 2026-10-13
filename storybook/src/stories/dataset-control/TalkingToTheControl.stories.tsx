import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DriveTheControlExample, WatchTheControlExample } from '../../dataset-control/examples/talkingExamples'

const DESCRIPTION = `DatasetControl hands your code one object, \`IDatasetControl\`, to talk to it: switch the view, reload it, follow every load, and reach any part on the page, such as the quick find or the column editor.

## Getting the control

Inside the control, any component gets it from \`useDatasetControl()\`:

\`\`\`tsx
const WonDealsButton = () => {
    const control = useDatasetControl()
    return <DefaultButton text='Won deals' onClick={() => control.loadView('won')} />
}
\`\`\`

Outside it, \`onReady\` hands it to the code that mounts the control, before the first load:

\`\`\`tsx
const controlRef = React.useRef<IDatasetControl>()

<DatasetControl onLoad={loadDeals} onReady={control => controlRef.current = control}>...</DatasetControl>
\`\`\`

## Views and loading

| Member | Description |
|---|---|
| \`loadView(viewId)\` | Loads the view through \`onLoad\`, as picking it in the view switcher does. |
| \`reload()\` | Loads the view shown again, on a new provider. |
| \`retry()\` | Runs the load that failed again. |
| \`getViewId()\` | The view shown. |
| \`getProvider()\` | The provider shown. Inside the control, \`useDataProvider()\` returns it too. |
| \`isLoading()\` | Whether a load is running. |
| \`getError()\` | What the last load threw, until the next one starts. |

\`loadView()\` and \`reload()\` ask the user first when the records have unsaved changes, and do nothing if they cancel. How a load runs is on [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).

## The parts

Every part on the page registers itself on the control, under its own key, for as long as it is rendered. \`control.parts\` finds it:

\`\`\`tsx
const quickFind = control.parts.get('quickFind')
quickFind.setQuery('Contoso')
quickFind.search()
\`\`\`

- \`get(key)\` returns the part, and throws when it isn't rendered.
- \`find(key)\` returns \`undefined\` instead, for a part that may not be there.
- \`whenAvailable(key, callback)\` calls back once the part is rendered.

| Key | Part | What your code can do |
|---|---|---|
| \`viewSwitcher\` | [**Views**](?path=/docs/datasetcontrol-parts-views--overview) | List the views, pick one, load the list again. |
| \`ribbon\` | [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview) | Load the commands again, see which are running. |
| \`quickFind\` | [**Quick find**](?path=/docs/datasetcontrol-parts-quick-find--overview) | Set the query and search. |
| \`editColumns\` | [**Edit columns**](?path=/docs/datasetcontrol-parts-edit-columns--overview) | Open, save and close the column editor. |
| \`pagination\` | [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview) | Move between the pages. |
| \`pageSizeSwitcher\` | [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview) | Change the page size, read the record range. |
| \`notifications\` | [**Notifications**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview) | Read the messages shown. |

Each part's page lists everything it offers, under *From your code*.

{{story: Drive the control}}

## Events

\`control.events\` tells you when loads start, finish and fail. Subscribe in \`onReady\`, so you don't miss the first load:

\`\`\`tsx
const onReady = (control: IDatasetControl) => {
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

{{story: Watch the control}}
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
    name: 'Drive the control',
    render: () => renderStory(<DriveTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `The buttons in the footer are a part of your own. They switch to *Won deals* and reload it through the control, and search and open the column editor through \`control.parts\`. Open **Code** to see how.`,
            },
        },
    },
}

export const WatchTheControl: Story = {
    name: 'Watch the control',
    render: () => renderStory(<WatchTheControlExample />),
    parameters: {
        docs: {
            description: {
                story: `Every event of the control, newest first. Switch the view, press *Show won deals*, which calls \`loadView('won')\`, or *Remount* to see \`onDestroyed\` and a fresh \`onReady\`.`,
            },
        },
    },
}
