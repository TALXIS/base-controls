import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FailedLoadExample, WaitingExample } from '../../dataset-control/examples/loadingDataExamples'

const DESCRIPTION = `DatasetControl gets its records from \`onLoad\`. Load whatever the view needs there, such as its definition, metadata or settings, and return a provider.

\`\`\`tsx
const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const view = await fetchDealView(params.viewId ?? DEFAULT_VIEW_ID)
    return { provider: await createDealsProvider(view), viewId: view.id }
}

<DatasetControl onLoad={loadDeals}>...</DatasetControl>
\`\`\`

## onLoad

\`onLoad\` is called when the control mounts, whenever the user switches the view, and when your code calls \`control.loadView()\` or \`control.reload()\`. Each call returns a new provider, and the control destroys the one it replaces.

| Parameter | Description |
|---|---|
| \`viewId\` | The view to load: the one the user picked, or on the first load the one the control kept. \`undefined\` when there is none, so \`onLoad\` picks the default. |

| Result | Default | Description |
|---|---|---|
| \`provider\` | Required | The provider every part works on. |
| \`viewId\` | The \`viewId\` it was called with | The view \`provider\` shows. Return it when \`onLoad\` picked the default. |

- Before showing the provider, the control puts back what it kept for the view, such as its sorting and search. See [**State**](?path=/docs/datasetcontrol-state--overview).
- It then loads the provider's first page, so the parts show records straight away. A provider \`onLoad\` already started loading isn't loaded again.
- The list of views the user can switch to comes from the view switcher. See [**Views**](?path=/docs/datasetcontrol-parts-views--overview).

## While loading

Everything inside \`DatasetControl\` waits for the provider: a placeholder stands in for it on the first load and on every view switch. Anything that should show straight away, such as a page title, goes outside the control.

{{story: Wait for the deals}}

## When loading fails

When \`onLoad\` throws, or the provider fails to load, the control shows the error in place of its parts.

- The error's \`message\` is the title.
- *Details* opens the error dialog with the error's \`cause\`, or its stack when it has none.
- *Try again* runs the load that failed again, as \`control.retry()\` does.

A part that throws while rendering is shown the same way, and *Try again* mounts the parts again. To change how the error looks, see [**Appearance**](?path=/docs/datasetcontrol-appearance--overview).

{{story: The deals service is down}}

## A shared provider

The control destroys every provider it lets go of: on unmount, on a view switch, and after a failed load. When \`onLoad\` returns a provider that lives on after the control, pass \`destroyProviderOnUnmount={false}\`.
`

const meta = {
    title: 'DatasetControl/Loading data',
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

export const WaitForTheDeals: Story = {
    name: 'Wait for the deals',
    render: () => renderStory(<WaitingExample />),
    parameters: {
        docs: {
            description: {
                story: `The deals take a moment to load. The title is outside the control, so it shows at once, while the placeholder stands in for the view switcher and the grid.`,
            },
        },
    },
}

export const TheDealsServiceIsDown: Story = {
    name: 'The deals service is down',
    render: () => renderStory(<FailedLoadExample />),
    parameters: {
        docs: {
            description: {
                story: `The first load fails. Open *Details* to read why, then press *Try again*, which succeeds.`,
            },
        },
    },
}
