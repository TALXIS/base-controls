import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyCatalogueExample, LoadingRowsExample, WarehouseLoadingExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
When the grid has no rows to show, it draws something in their place: a message when there are none, an overlay while they load, and a row standing in for a group's rows while they load or after they fail to. To change how any of them looks, pass \`components\` to \`<Grid.Root />\`.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    components={{ emptyRecordsOverlay: { onRenderIcon: props => <Icon {...props} iconName='ProductCatalog' /> } }} />
\`\`\`

- Each key replaces the parts of one overlay. Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

## No rows

| Key | Parts |
|---|---|
| \`emptyRecordsOverlay\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` |

The text is the grid's \`noRecordsFound\` label, set through \`labels\`.

{{story: An empty catalogue}}

## Loading

| Key | Parts |
|---|---|
| \`loadingOverlay\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` |

The text is the message the provider loads with, \`provider.setLoading(true, message)\`, and is drawn only while there is one.

{{story: Waiting for the warehouse}}

## Rows loading or failing

| Key | Parts |
|---|---|
| \`rowLoading\` | \`onRenderShimmer\` |
| \`rowError\` | \`onRenderMessageBar\` |

- \`rowLoading\` stands in for a group's rows while they load on the server-side row model.
- \`rowError\` stands in for rows or totals that failed to load, with the provider's error message.

{{story: Rows that are still loading}}
`

const meta = {
    title: 'Grid/Appearance/Overlays',
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

export const AnEmptyCatalogue: Story = {
    name: 'An empty catalogue',
    render: () => renderStory(<EmptyCatalogueExample />),
    parameters: {
        docs: {
            description: {
                story: `\`emptyRecordsOverlay\` swaps the icon and adds a hint under the message.`,
            },
        },
    },
}

export const WaitingForTheWarehouse: Story = {
    name: 'Waiting for the warehouse',
    render: () => renderStory(<WarehouseLoadingExample />),
    parameters: {
        docs: {
            description: {
                story: `\`loadingOverlay\` draws a slow warehouse lookup as a card with a progress bar and the provider's message. Press *Check stock again*.`,
            },
        },
    },
}

export const RowsThatAreStillLoading: Story = {
    name: 'Rows that are still loading',
    render: () => renderStory(<LoadingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`rowLoading\` draws a category's rows as a spinner while they load on the server-side row model. Open a category (AG Grid Enterprise).`,
            },
        },
    },
}
