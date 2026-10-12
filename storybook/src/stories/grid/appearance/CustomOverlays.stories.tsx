import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyCatalogueExample, WarehouseLoadingExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
The grid draws an overlay over its rows when it has none to show: a message when there are no records, and a spinner while they load. To change how either looks, pass \`components.overlays\` to \`<Grid />\`.

\`\`\`tsx
<DataProviderContextProvider provider={provider}>
    <Grid
        modules={{ rowModel: createClientSideRowModelModule() }}
        components={{ overlays: { emptyRecords: { onRenderIcon: props => <Icon {...props} iconName='ProductCatalog' /> } } }} />
</DataProviderContextProvider>
\`\`\`

- Parts follow the rules in *Replacing what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

## No records

| Key | Parts |
|---|---|
| \`overlays.emptyRecords\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` |

The text is the grid's \`noRecordsFound\` label, set through \`labels\`. The same empty state is \`DatasetControl.Ui.EmptyRecords\`, for showing it outside a grid.

{{story: An empty catalogue}}

## Loading

| Key | Parts |
|---|---|
| \`overlays.loading\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` |

The text is the message the provider loads with, \`provider.setLoading(true, message)\`, and is drawn only while there is one.

{{story: Waiting for the warehouse}}
`

const meta = {
    title: 'Grid/Appearance/Custom overlays',
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
                story: `\`overlays.emptyRecords\` swaps the icon and adds a hint under the message.`,
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
                story: `\`overlays.loading\` draws a slow warehouse lookup as a card with a progress bar and the provider's message. Press *Check stock again*.`,
            },
        },
    },
}
