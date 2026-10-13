import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { APartOfYourOwnExample } from '../../../dataset-control/examples/extendingExamples'

const DESCRIPTION = `Any component inside \`DatasetControl\` can read and drive the control: \`useDataProvider()\` returns the provider, and \`useDatasetControl()\` returns the control. \`onReady\` hands the same control to the code that mounts it.

{{story: A part of your own}}

## The control

| Member | What it does |
|---|---|
| \`loadView(viewId)\` | Loads the view through \`onLoad\`, on a new provider, asking first when there are unsaved changes. |
| \`reload()\` | Loads the view shown again the same way. |
| \`retry()\` | Runs the load that failed again. |
| \`getViewId()\` | The view the provider shown is for. |
| \`getProvider()\` | The provider shown, from the last load that succeeded. |
| \`isLoading()\` | Whether a load is running. |
| \`getError()\` | What the last load threw, until the next one starts. |
| \`events\` | \`onLoadStarted\`, \`onLoaded\`, \`onLoadFailed\` and \`onDestroyed\`. See [**Props and events**](?path=/docs/datasetcontrol-get-started-props-and-events--overview). |
| \`parts\` | The parts rendered inside the control. See below. |

## Parts

\`control.parts.get(key)\` returns a part and throws when it isn't rendered; \`find(key)\` returns \`undefined\` instead; \`whenAvailable(key, callback)\` calls back once the part is there.

| Key | Type | What it offers |
|---|---|---|
| \`viewSwitcher\` | \`IDatasetControlViewSwitcher\` | \`getViews()\`, \`getCurrentView()\`, \`select(viewId)\`, \`reload()\` |
| \`quickFind\` | \`IDatasetControlQuickFind\` | \`getQuery()\`, \`setQuery(query)\`, \`search()\`, \`clear()\`, \`getColumns()\` |
| \`editColumns\` | \`IDatasetControlEditColumns\` | \`open()\`, \`close()\`, \`save()\`, \`isOpen()\` |
| \`pagination\` | \`IDatasetControlPagination\` | \`getPageNumber()\`, \`canMovePrevious()\`, \`canMoveNext()\`, \`moveFirst()\`, \`movePrevious()\`, \`moveNext()\` |
| \`pageSizeSwitcher\` | \`IDatasetControlPageSizeSwitcher\` | \`getPageSize()\`, \`getPageSizes()\`, \`setPageSize(size)\`, \`getRecordRange()\` |
| \`notifications\` | \`IDatasetControlNotifications\` | \`getMessages()\` |

A part is there only while it is rendered, so reach it with \`find\`. Each one has \`events\` to subscribe to as well.

## Parts of your own

A part of your own is a component: put it in a region and read the provider with \`useDataProviderEvents(events)\`, which draws the component again on each of the provider's \`events\`, as \`SelectedValue\` in the example does. For one that looks like a built-in part, draw it with \`DatasetControl.Ui\`, which holds every part as plain UI. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview).
`

const meta = {
    title: 'DatasetControl/Customization/Extending',
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

export const APartOfYourOwn: Story = {
    name: 'A part of your own',
    render: () => renderStory(<APartOfYourOwnExample />),
    parameters: {
        docs: {
            description: {
                story: `Select deals to see their total value in the footer, from a part of your own. The buttons in the header drive the control: they switch the view, reload it, search and open the column editor.`,
            },
        },
    },
}
