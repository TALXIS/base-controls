import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { SelectedValueExample } from '../../dataset-control/examples/yourOwnPartsExamples'
import { GalleryExample } from '../../dataset-control/examples/collectionViewExamples'

const DESCRIPTION = `A part of your own is any component you put inside the control: a total in the footer, a filter in the header, or a gallery in place of the grid. Inside the control, it has what the built-in parts have:

| Hook | Returns |
|---|---|
| \`useDataProviderEvents(events)\` | The provider, and draws the component again on each of the provider's \`events\`. |
| \`useDataProvider()\` | The provider, without drawing again. |
| \`useDatasetControl()\` | The control, to switch views or reach the built-in parts. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). |
| \`useControlStateStore(stateKey)\` | Where the component keeps what it should remember, per view. See [**State**](?path=/docs/datasetcontrol-state--overview). |
| \`useDatasetControlRegion()\` | \`'start'\` or \`'end'\`: the side of the header or footer the component is in. |

## A part in a region

\`\`\`tsx
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + provider.getRecordsMap()[id].getValue('value'), 0)
    return <Text>Selected: {total}</Text>
}

<DatasetControl.Footer.Start>
    <SelectedValue />
</DatasetControl.Footer.Start>
\`\`\`

{{story: Total of the selected deals}}

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

{{story: Products as a gallery}}
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
    name: 'Total of the selected deals',
    render: () => renderStory(<SelectedValueExample />),
    parameters: {
        docs: {
            description: {
                story: `Select deals to see their total value in the footer.`,
            },
        },
    },
}

export const ProductsAsAGallery: Story = {
    name: 'Products as a gallery',
    render: () => renderStory(<GalleryExample />),
    parameters: {
        docs: {
            description: {
                story: `An office furniture shop's products as cards. Switch views, search, page, and click cards to select them: the ribbon follows the selection. Scroll, switch to *Seating* and back: the gallery is scrolled where you left it.`,
            },
        },
    },
}
