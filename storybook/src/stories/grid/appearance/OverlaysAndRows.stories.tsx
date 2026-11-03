import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyCatalogueExample, ErrorRowsExample, LoadingRowsExample, WarehouseLoadingExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
A grid does not always have records to draw: the provider may still be loading them or hold none at all, and a group's records may still be on their way or fail to load. In those moments the grid draws something in their place, an overlay over the rows or a row standing in for the missing records, so the user knows what is going on. You can redraw each of them to fit your page, from a different icon to a whole card of your own.

## Changing how it looks

These are the only parts \`<Grid>\` itself takes \`components\` for, read on every render. How slots work is under *Changing how it looks* on [**Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`overlays.emptyRecords\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`EmptyRecordsUiComponents\` | The overlay of a grid with no rows; its text is \`grid.noRecordsFound\` |
| \`overlays.loading\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | | The overlay while the provider loads; the text is the provider's loading message, drawn only while there is one |
| \`rows.loading\` | \`onRenderShimmer\` | | A group's records while they load on the server-side row model |
| \`rows.error\` | \`onRenderMessageBar\` | | Records or totals that failed to load, with the provider's error message |

## No records

\`overlays.emptyRecords\` draws the grid's empty state. To change its text, see [**Localization**](?path=/docs/concepts-localization--overview). To show the same empty state outside a grid, use \`DatasetControl.Ui.EmptyRecords\`.

{{story: Show an empty catalogue}}

## Loading

\`overlays.loading\` draws over the rows while the provider loads. Its text is the message the provider loads with, \`provider.setLoading(true, message)\`.

{{story: Wait for the warehouse}}

\`rows.loading\` draws a group's records while they load on the server-side row model.

{{story: Show rows that are still loading}}

## Failed loads

\`rows.error\` draws a group's records that failed to load on the server-side row model, and a totals row whose query failed.

{{story: Try a category again}}
`

const meta = {
    title: 'Controls/Grid/Appearance/Overlays and rows',
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
                story: `\`overlays.emptyRecords\` swaps the icon and adds a hint under the message, and \`LabelsProvider\` rewords \`grid.noRecordsFound\`.`,
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
