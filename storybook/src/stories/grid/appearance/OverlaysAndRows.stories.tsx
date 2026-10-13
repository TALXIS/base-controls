import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyCatalogueExample, ErrorRowsExample, LoadingRowsExample, WarehouseLoadingExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
When the grid has no records to draw, it draws something in their place: an overlay over the rows while the provider loads or holds nothing, and a row in place of records that are still loading or failed to load. Change how each looks through \`components\` on \`<Grid />\`.

\`\`\`tsx
<DatasetControl onLoad={loadProducts}>
    <DatasetControl.Body>
        <Grid
            modules={{ rowModel: createClientSideRowModelModule() }}
            components={{
                overlays: { emptyRecords: { onRenderIcon: props => <Icon {...props} iconName='ProductCatalog' /> } },
                rows: { error: { onRenderMessageBar: props => <MessageBar {...props} messageBarType={MessageBarType.warning} /> } },
            }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

Every key and part is optional and follows the \`components\` rules. See *Replace what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

## No records

\`overlays.emptyRecords\` draws a grid with no rows, with the grid's \`noRecordsFound\` label as its text. Its parts are \`onRenderContainer\`, \`onRenderIcon\` and \`onRenderText\`. To show the same empty state outside a grid, use \`DatasetControl.Ui.EmptyRecords\`.

{{story: Show an empty catalogue}}

## Loading

\`overlays.loading\` draws over the rows while the provider loads. Its text is the message the provider loads with, \`provider.setLoading(true, message)\`, drawn only while there is one. Its parts are \`onRenderContainer\`, \`onRenderSpinner\` and \`onRenderText\`.

{{story: Wait for the warehouse}}

\`rows.loading\` draws a group's records while they load on the server-side row model, through \`onRenderShimmer\`.

{{story: Show rows that are still loading}}

## Failed loads

\`rows.error\` draws records or totals that failed to load, with the provider's error message, through \`onRenderMessageBar\`.

{{story: Try a category again}}
`

const meta = {
    title: 'Grid/Appearance/Overlays and rows',
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
    name: 'Show an empty catalogue',
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
    name: 'Wait for the warehouse',
    render: () => renderStory(<WarehouseLoadingExample />),
    parameters: {
        docs: {
            description: {
                story: `\`overlays.loading\` draws a slow warehouse lookup as a card with a progress bar and the provider's message. Try: press *Check stock again*.`,
            },
        },
    },
}

export const RowsThatAreStillLoading: Story = {
    name: 'Show rows that are still loading',
    render: () => renderStory(<LoadingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`rows.loading\` draws a category's rows as a spinner while they load on the server-side row model. Try: open a category (AG Grid Enterprise).`,
            },
        },
    },
}

export const TryACategoryAgain: Story = {
    name: 'Try a category again',
    render: () => renderStory(<ErrorRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`rows.error\` turns a failed load into a warning with a *Try again* button, which calls AG Grid's \`retryServerSideLoads()\`. Try: open a category; the warehouse drops the first one, then loads it on retry (AG Grid Enterprise).`,
            },
        },
    },
}
