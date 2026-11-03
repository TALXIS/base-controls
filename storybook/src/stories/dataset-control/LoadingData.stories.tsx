import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { WaitingExample } from '../../dataset-control/examples/loadingDataExamples'

const DESCRIPTION = `
The control's \`onLoad\` returns the provider for the view the user is on. Load what the view needs, create the provider and return it.

\`\`\`tsx
const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    //createDealsProvider is yours, see Data providers
    const provider = createDealsProvider()
    const resolved = view && await view.resolve(provider)
    provider.setFiltering(resolved?.data?.filtering ?? null)
    return { provider }
}

<DatasetControl onLoadViews={loadViews} onLoad={loadDeals}>...</DatasetControl>
\`\`\`

\`onLoad\` gets one parameter, \`view\`: the view as listed, or \`undefined\` when there are no views. It returns \`{ provider }\`. Creating a provider is on [**Data providers**](?path=/docs/concepts-data-providers--overview); what a view carries is on [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

{{story: Wait for the deals}}

## When the control loads

Every load mounts the control anew. These start one:

| What starts a load | Asks about unsaved changes |
|---|---|
| The first mount | – |
| Picking a view, or \`loadView()\` | Yes |
| Saving *Edit columns*, closing *Manage views*, or \`reload()\` | Yes |
| Saving a new user view | Yes |
| *Try again*, or \`retry()\` | No |

- Everything inside the control mounts anew: a new \`IDatasetControl\`, new modules, new parts and a new provider from \`onLoad\`. Listeners subscribe again: see *Get the control* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview).
- A placeholder stands in for the parts until the first page is in, so put what must show at once, such as a page title, outside the control.

## Load order

| Step | What happens |
|---|---|
| 1 | \`onLoadDependencies\` runs. What it returns is \`control.getDependencies()\` from here on. |
| 2 | Each module's \`onLoad\` runs, in the order of \`modules\`. |
| 3 | \`onLoadViews\` lists the views, and the modules add theirs, such as the user's own views. |
| 4 | The control picks the view: the one asked for or the one the user was on, while it is still listed, else the first. |
| 5 | \`onLoad\` gets that view and returns the provider. Call \`view.resolve(provider)\` for the view's \`data\`; the control resolves it once either way. |
| 6 | The control sets the view's linking and columns on the provider, then puts back what the user changed in the view: see [**State**](?path=/docs/controls-datasetcontrol-state--overview). |
| 7 | The provider's first page loads, unless \`onLoad\` already requested it, such as by awaiting \`provider.refresh()\`. Then the parts show. |

When any step throws, the error shows in place of the parts, with *Try again*: see [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview).

## Load what every view needs once

\`onLoadDependencies\` loads what both the modules and \`onLoad\` read, such as the entity's metadata, ahead of them on every load. \`onLoad\` reaches it through the control, which \`onMounted\` hands you before the load:

\`\`\`tsx
const controlRef = React.useRef<IDatasetControl>()

//fetchEntityMetadata and IEntityMetadata are yours
const loadMetadata = async () => await fetchEntityMetadata('deal')

const loadDeals = async ({ view }: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const metadata = controlRef.current!.getDependencies<IEntityMetadata>()
    ...
}

<DatasetControl onLoadDependencies={loadMetadata} onLoad={loadDeals} onMounted={control => controlRef.current = control}>...</DatasetControl>
\`\`\`

A module reads it the same way, from the control its \`onLoad\` gets.

## Keep a shared provider

The control destroys every provider it lets go of; to keep one the rest of your page uses, pass \`destroyProviderOnUnmount={false}\` and see *Lifetime* on [**Data providers**](?path=/docs/concepts-data-providers--overview).
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
                story: `The title outside the control shows at once, while a placeholder stands in for the view switcher and the grid. Try: switch the view and watch the placeholder come back for the new mount.`,
            },
        },
    },
}
