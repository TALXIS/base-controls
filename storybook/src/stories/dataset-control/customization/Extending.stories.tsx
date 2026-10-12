import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { APartOfYourOwnExample } from '../../../dataset-control/examples/extendingExamples'

const DESCRIPTION = `Any component inside \`DatasetControl\` can read and drive the control: \`useDataProvider()\` returns the provider, and \`useRequiredDatasetControlRuntime()\` returns the control's runtime. In a component that may also sit outside a control, \`useDatasetControlRuntime()\` returns \`undefined\` there instead of throwing. \`onReady\` hands the same runtime to the code that mounts the control.

{{story: A part of your own}}

## The runtime

| Member | What it does |
|---|---|
| \`reload({ viewId })\` | Loads the view through \`onLoad\`, asking first when there are unsaved changes. |
| \`retry()\` | Runs the load that failed again. |
| \`getViewId()\` | The view the provider shown is for. |
| \`getViews()\` | The views the last load that succeeded returned. |
| \`getViewStateStore(viewId?)\` | Where the parts keep their state for a view: the one shown, unless another is given. See [**State**](?path=/docs/datasetcontrol-state-overview--overview). |
| \`getProvider()\` | The provider shown, from the last load that succeeded. |
| \`getProviderKey()\` | Changes with every provider, for keying what renders it. |
| \`isLoading()\` | Whether a load is running. |
| \`getError()\` | What the last load threw, until the next one starts. |
| \`events\` | \`onLoadStarted\`, \`onLoaded\`, \`onLoadFailed\` and \`onDestroyed\`. See [**Props and events**](?path=/docs/datasetcontrol-get-started-props-and-events--overview). |
| \`services\` | What the control is made of. See below. |

## Services

\`runtime.services.get(key)\` returns a service and throws when there is none; \`find(key)\` returns \`undefined\` instead; \`whenAvailable(key, callback)\` calls back once the service is there.

| Key | What it is |
|---|---|
| \`viewSwitcher\` | \`getViews()\`, \`getCurrentView()\`, \`select(viewId)\` |
| \`quickFind\` | \`getQuery()\`, \`setQuery(query)\`, \`search()\`, \`clear()\`, \`getColumns()\` |
| \`editColumns\` | \`open()\`, \`close()\`, \`save()\`, \`isOpen()\` |
| \`pagination\` | \`getPageNumber()\`, \`canMovePrevious()\`, \`canMoveNext()\`, \`moveFirst()\`, \`movePrevious()\`, \`moveNext()\` |
| \`pageSizeSwitcher\` | \`getPageSize()\`, \`getPageSizes()\`, \`setPageSize(size)\`, \`getRecordRange()\` |
| \`notifications\` | \`getMessages()\` |

A part's service is there only while the part is rendered, so reach it with \`find\`. The provider and the views are on the runtime: \`getProvider()\` and \`getViews()\`, or \`useDataProvider()\` in a component. The classes behind them are on \`DatasetControl.Classes\`, for typing.

## Parts of your own

A part of your own is a component: put it in a region, read the provider with \`useDataProvider()\`, and draw again on the provider's events, as \`SelectedValue\` in the example does. For one that looks like a built-in part, draw it with \`DatasetControl.Ui\`, which holds every part as plain UI. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview).
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
                story: `Select deals to see their total value in the footer, from a part of your own. The buttons in the header drive the control through its runtime: they switch the view, search and open the column editor.`,
            },
        },
    },
}
