import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { WaitingExample } from '../../dataset-control/examples/loadingDataExamples'

const DESCRIPTION = `
The control's \`onLoad\` returns the provider for the view the user is on. Load whatever the view needs, create the provider and return it. Creating a provider is on [**Data providers**](?path=/docs/concepts-data-providers--overview); what a view carries for \`onLoad\` is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

\`\`\`tsx
const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const provider = await createDealsProvider()
    const resolved = view && await view.resolve(provider)
    applyDealView(provider, resolved?.data)
    return { provider }
}

<DatasetControl onLoadViews={loadViews} onLoad={loadDeals}>...</DatasetControl>
\`\`\`

{{story: Wait for the deals}}

## Every load is a new mount

The control loads when it mounts, when the user switches the view, saves Edit columns, closes *Manage views* or saves a new view of their own, and when your code calls \`loadView()\`, \`reload()\` or \`retry()\`. Each of those mounts everything inside the control anew: a new \`IDatasetControl\`, new modules, new parts and a new provider from \`onLoad\`. A placeholder stands in for the parts until the provider's first page is in. Put anything that should show straight away, such as a page title, outside the control.

What the user changed in a view, such as its sorting or columns, comes back on its next load: see [**State**](?path=/docs/controls-datasetcontrol-state--overview). Code that listens to the control or its parts subscribes again on each mount: see *Get the control* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).

## What runs, in order

| Step | What happens |
|---|---|
| 1 | \`onLoadDependencies\` runs. What it returns is \`control.getDependencies()\` from here on. |
| 2 | Each module's \`onLoad\` runs, in the order of \`modules\`. |
| 3 | \`onLoadViews\` lists the views, and the modules add theirs, such as the user's own views. |
| 4 | The control picks the view: the one asked for or the one the user was on, while it is still listed, else the first. |
| 5 | \`onLoad\` gets that view and returns the provider. Call \`view.resolve(provider)\` for the view's \`data\`; the control resolves it once either way. |
| 6 | The control sets the view's linking and columns on the provider, then puts back what the user changed in the view. |
| 7 | The provider's first page loads, unless \`onLoad\` already started it. Then the parts show. |

\`onLoad\` gets one parameter, \`view\`: the view as listed, or \`undefined\` when there are no views. It returns \`{ provider }\`. When any step throws, the error shows in place of the parts, with *Try again*: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

## Load what every view needs once

\`onLoadDependencies\` loads what both the modules and \`onLoad\` read, such as the entity's metadata, ahead of them on every load:

\`\`\`tsx
const controlRef = React.useRef<IDatasetControl>()

const loadMetadata = async () => await fetchEntityMetadata('deal')

const loadDeals = async ({ view }: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const metadata = controlRef.current!.getDependencies<IEntityMetadata>()
    ...
}

<DatasetControl onLoadDependencies={loadMetadata} onLoad={loadDeals} onMounted={control => controlRef.current = control}>...</DatasetControl>
\`\`\`

A module reads it the same way, from the control its \`onLoad\` gets.

## Keep a shared provider

The control destroys every provider it lets go of: the one it showed when the mount goes, and the one whose load failed. When \`onLoad\` returns a provider that lives on after the control, such as one the rest of your page uses too, pass \`destroyProviderOnUnmount={false}\` and destroy it yourself. See *Lifetime* on [**Data providers**](?path=/docs/concepts-data-providers--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Loading data',
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
                story: `The deals take a moment to load: the title outside the control shows at once, while the placeholder stands in for the view switcher and the grid. Try: switch the view and watch the placeholder come back for the new mount.`,
            },
        },
    },
}
