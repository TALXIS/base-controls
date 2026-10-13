import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FailedLoadExample, WaitingExample } from '../../dataset-control/examples/loadingDataExamples'

const DESCRIPTION = `
The control's \`onLoad\` returns the provider for the view the user is on. Load whatever the view needs there, such as its definition, metadata or settings, then create the provider and return it. Creating a provider is on [**Data providers**](?path=/docs/data-providers--overview).

\`\`\`tsx
const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const view = await fetchDealView(params.viewId ?? DEFAULT_VIEW_ID)
    return { provider: await createDealsProvider(view), viewId: view.id }
}

<DatasetControl onLoad={loadDeals}>...</DatasetControl>
\`\`\`

## Load a view

The control calls \`onLoad\` when it mounts, whenever the user switches the view, and when your code calls \`control.loadView()\`, \`control.reload()\` or \`control.retry()\`. Each call returns a new provider.

| Parameter | Description |
|---|---|
| \`viewId\` | The view to load: the one the user picked, or on the first load the one the control kept. \`undefined\` when there is none, so \`onLoad\` picks the default. |

| Result | Default | Description |
|---|---|---|
| \`provider\` | Required | The provider every part works on. |
| \`viewId\` | The \`viewId\` it was called with | The view \`provider\` shows. Return it when \`onLoad\` picked the default. |

- Before showing the provider, the control puts back what it kept for the view, such as its sorting and search. See [**State**](?path=/docs/datasetcontrol-state--overview).
- It then loads the provider's first page, so the parts show records straight away.
- The views the user can switch between come from the view switcher's own \`onLoad\`. See [**Views**](?path=/docs/datasetcontrol-parts-views--overview).

## Show a placeholder while loading

Everything inside \`DatasetControl\` waits for the provider: a placeholder shows in place of the parts on the first load and on every view switch. Put anything that should show straight away, such as a page title, outside the control, or change the placeholder on [**Appearance**](?path=/docs/datasetcontrol-appearance--overview).

{{story: Wait for the deals}}

## Recover from a failed load

When \`onLoad\` throws, or the provider fails to load, the control shows the error in place of its parts.

- The error's \`message\` is the title.
- *Details* opens the error dialog with the error's \`cause\`, or its stack when it has none.
- *Try again* runs the load that failed again, as \`control.retry()\` does.

A part that throws while rendering is shown the same way, and *Try again* mounts the parts again.

{{story: Recover from a failed load}}

## Keep a shared provider

The control destroys every provider it lets go of: the one a new load replaces, the one that failed to load, and the one it shows when it unmounts. When \`onLoad\` returns a provider that lives on after the control, such as one the rest of your page uses too, pass \`destroyProviderOnUnmount={false}\`, and destroy it yourself when you are done. See *Lifetime* on [**Data providers**](?path=/docs/data-providers--overview).
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
                story: `The deals take a moment to load: the title outside the control shows at once, while the placeholder shows in place of the view switcher and the grid. Try: switch the view and watch the placeholder come back.`,
            },
        },
    },
}

export const TheDealsServiceIsDown: Story = {
    name: 'Recover from a failed load',
    render: () => renderStory(<FailedLoadExample />),
    parameters: {
        docs: {
            description: {
                story: `The first load fails, and the control shows the error in place of its parts. Try: open *Details* to read why, then press *Try again*, which succeeds.`,
            },
        },
    },
}
