import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { EmptyCatalogueExample, ErrorRowsExample, LoadingRowsExample, WarehouseLoadingExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
While the provider loads, or when it holds no records, the grid draws an overlay over the rows; a group whose records are still loading, or failed to load, gets a row in their place. \`components\` on \`<Grid>\` redraws each of them, from a different icon to a card of your own. Try it below: open **Code** and change the hint under the message.

{{canvas: Show an empty catalogue}}

## Changing how it looks

These are the only pieces \`<Grid>\` itself takes \`components\` for; \`components\` is *Live*. How slots work is on the DatasetControl's [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`overlays.emptyState\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`EmptyStateUiComponents\` | The overlay of a grid with no rows; its text is \`grid.noRecordsFound\` |
| \`overlays.loading\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | | The overlay while the provider loads; the text is the provider's loading message, drawn only while there is one |
| \`rows.loading\` | \`onRenderShimmer\` | | A group's records while they load on the server-side row model |
| \`rows.error\` | \`onRenderMessageBar\` | | Records or totals that failed to load, with the provider's error message |

## No records

\`overlays.emptyState\` draws the grid's empty state, as the example above does. To change its text, see [**Localization**](?path=/docs/concepts-localization--overview). To show the same empty state outside a grid, use \`DatasetControl.EmptyState\`: see [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview).

## Loading

\`overlays.loading\` draws over the rows while the provider loads. Its text is the message the provider loads with, \`provider.setLoading(true, message)\`.

{{story: Wait for the warehouse}}

\`rows.loading\` draws a group's records while they load on the server-side row model.

{{story: Show rows that are still loading}}

## Failed loads

\`rows.error\` draws a group's records that failed to load on the server-side row model, and a totals row whose query failed.

{{story: Try a category again}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-grid-modules--overview', text: 'Pick the row model that loads a group\'s records as it opens.' },
    { title: 'Localization', iconName: 'Translate', href: '?path=/docs/concepts-localization--overview', text: 'Change the empty state\'s text and every other label.' },
    { title: 'Custom cells', iconName: 'TableComputed', href: '?path=/docs/controls-grid-appearance-custom-cells--overview', text: 'Redraw pieces of a column\'s cells, or lay a cell out yourself.' },
]

const meta = {
    title: 'Controls/Grid/Appearance/Overlays and rows',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
                story: `\`rows.error\` turns a failed load into a warning with a *Try again* button, which calls AG Grid's \`retryServerSideLoads()\`. Try: open a category, whose first load fails (AG Grid Enterprise).`,
            },
        },
    },
}
