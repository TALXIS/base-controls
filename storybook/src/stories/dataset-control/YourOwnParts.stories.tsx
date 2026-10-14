import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SelectedValueExample } from '../../dataset-control/examples/yourOwnPartsExamples'
import { GalleryExample } from '../../dataset-control/examples/collectionViewExamples'

const DESCRIPTION = `
A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it has what the built-in parts have:

| Hook | Description |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, and draws the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. More on reading it under *Read records* and *Events* on [**Data providers**](?path=/docs/data-providers--overview). |
| \`useDatasetControl()\` | The control, to switch views or reach the built-in parts. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view. See *Keep your own part's state* on [**State**](?path=/docs/datasetcontrol-state--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`, the side of the header or footer the component is in; \`undefined\` outside both. |
| \`useDatasetControlHeader()\` | Inside the header, \`showOnly()\` hides everything in the header except the part calling it, such as while it needs the whole line, and \`showAll()\` brings the rest back; \`undefined\` outside the header. |
| \`useCompact()\` | Whether the header is compact, so the component can draw smaller. See *Your own part in a compact header* on [**Layout**](?path=/docs/datasetcontrol-layout--overview). |

## A part in a region

\`\`\`tsx
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + (provider.getRecordsMap()[id].getValue('value') ?? 0), 0)
    return <Text>Selected: {total}</Text>
}

<DatasetControl.Footer.Start>
    <SelectedValue />
</DatasetControl.Footer.Start>
\`\`\`

{{story: Total the selected deals}}

To make it look like a built-in part, draw it with \`DatasetControl.Ui\`, which holds every part as plain UI. See [**Appearance**](?path=/docs/datasetcontrol-appearance--overview).

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart.

| Provider | What it gives you |
|---|---|
| \`getRecords()\` | The records of the page, already searched, filtered and sorted. |
| \`getColumns()\` | The columns, as the user set them in Edit columns. |
| \`getSelectedRecordIds()\`, \`setSelectedRecordIds(ids)\` | The selection, which the ribbon follows. |
| \`onNewDataLoaded\` | Raised when the records change: after a search, a page change or a reload. |
| \`onRecordsSelected\` | Raised when the selection changes. |
| \`onRecordColumnValueChanged\` | Raised when a record's value changes. |

- Pass the events your view shows to \`useDataProviderEvents\`.
- Keep what your view should remember, such as its scroll, with \`useControlStateStore\`.
- Wrap the view in \`DatasetControl.EmptyRecords\` for an empty state. See [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview).
- Edit columns changes the provider's columns, so it is useful only when your view shows them.

{{story: Show products as a gallery}}
`

const meta = {
    title: 'DatasetControl/Your own parts',
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

export const TotalOfTheSelectedDeals: Story = {
    name: 'Total the selected deals',
    render: () => renderStory(<SelectedValueExample />),
    parameters: {
        docs: {
            description: {
                story: `A part of your own in the footer, redrawn on every selection by \`useDataProviderEvents\`. Try: select a few deals.`,
            },
        },
    },
}

export const ProductsAsAGallery: Story = {
    name: 'Show products as a gallery',
    render: () => renderStory(<GalleryExample />),
    parameters: {
        docs: {
            description: {
                story: `An office furniture shop's products as cards in place of the grid; the ribbon follows the selection as around a grid. Try: click cards to select them, scroll, then switch to *Seating* and back.`,
            },
        },
    },
}
