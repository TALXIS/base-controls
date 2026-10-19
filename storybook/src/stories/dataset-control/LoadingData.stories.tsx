import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { WaitingExample } from '../../dataset-control/examples/loadingDataExamples'

const DESCRIPTION = `
The control's \`onLoad\` returns the provider for the view the user is on. Load whatever the view needs there, such as metadata or settings, then create the provider and return it. Creating a provider is on [**Data providers**](?path=/docs/data-providers--overview), and the views, with what each one carries for \`onLoad\`, are on [**Views**](?path=/docs/datasetcontrol-views--overview).

\`\`\`tsx
const loadDeals = async (params: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    return { provider: await createDealsProvider(params.view?.data) }
}

<DatasetControl onLoad={loadDeals}>...</DatasetControl>
\`\`\`

## Load a view

The control calls \`onLoad\` when it mounts, whenever the user switches the view, and when your code calls \`control.loadView()\`, \`control.reload()\` or \`control.retry()\`. Each call returns a new provider.

| Parameter | Description |
|---|---|
| \`view\` | The view to load, with its \`data\`. \`undefined\` when there are no views. Which view it is, is under *Load what the view describes* on [**Views**](?path=/docs/datasetcontrol-views--overview). |

| Result | Default | Description |
|---|---|---|
| \`provider\` | Required | The provider every part works on. |

- Before showing the provider, the control puts back what it kept for the view, such as its sorting and search. See [**State**](?path=/docs/datasetcontrol-state--overview).
- It then loads the provider's first page, so the parts show records straight away.

## Show a placeholder while loading

Everything inside \`DatasetControl\` waits for the provider: a placeholder shows in place of the parts on the first load and on every view switch. Put anything that should show straight away, such as a page title, outside the control, or change the placeholder on *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview).

{{story: Wait for the deals}}

## When a load fails

Throw from \`onLoad\`: the control shows the error in place of its parts, with *Try again*. See [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview).

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
