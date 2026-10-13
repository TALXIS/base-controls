import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { FailedLoadExample, WaitingExample } from '../../../dataset-control/examples/loadingDataExamples'

const DESCRIPTION = `DatasetControl gets its provider from \`onLoad\`. Load whatever the provider needs there, such as the view's definition, metadata or settings. A placeholder stands in for the control until the provider has loaded its first page.

\`\`\`tsx
const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const view = await fetchDealView(params.viewId ?? DEFAULT_VIEW_ID)
    return { provider: await createDealsProvider(view), viewId: view.id }
}

<DatasetControl onLoad={loadDeals}>...</DatasetControl>
\`\`\`

## onLoad

\`onLoad\` is called when the control mounts, on every view switch, and on \`loadView()\` and \`reload()\`. Each call returns a new provider.

- It is called with the \`viewId\` to load: the view the user picked, or on the first load the one the control kept. With no \`viewId\`, pick the default view, and return its id beside the provider.
- Before showing the provider, the control puts back what it kept for the view, such as its sorting and search. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview).
- It then loads the provider's first page, so the parts show records straight away. A provider \`onLoad\` already started loading isn't loaded again.
- The views to switch between come from the view switcher: see [**Views**](?path=/docs/datasetcontrol-parts-views--overview).

The parameters and the result are on [**Hooks and types**](?path=/docs/datasetcontrol-api-hooks-and-types--overview).

## While loading

Everything inside \`DatasetControl\` waits for the provider: a placeholder stands in for it on the first load and on every view switch. Anything that should show straight away, such as a title, goes outside the control.

{{story: Wait for the deals}}

## When loading fails

When \`onLoad\` throws, or the provider fails to load, the control shows the error in place of its parts and destroys the provider that failed.

- The error's \`message\` is the title.
- *Details* opens the error dialog with the error's \`cause\`, or its stack when it has no cause.
- *Try again* runs the load that failed again.

The same happens when a part throws while rendering, and *Try again* then mounts the parts again. To change how the error looks, see [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview).

{{story: The deals service is down}}

## A shared provider

The control destroys every provider it lets go of: on unmount, on a view switch, and after a failed load. When \`onLoad\` returns a provider that lives on after the control, such as one shared with another part of your page, pass \`destroyProviderOnUnmount={false}\`.
`

const meta = {
    title: 'DatasetControl/Get started/Loading data',
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
