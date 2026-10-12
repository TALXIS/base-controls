import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GalleryExample } from '../../../dataset-control/examples/collectionViewExamples'

const DESCRIPTION = `The parts work on the provider, not on the grid, so anything that shows records can sit in \`DatasetControl.Body\`: a list, cards, a calendar or a chart. Inside the control, \`useDataProvider()\` returns the provider \`onLoad\` returned.

{{story: Products as a gallery}}

| Provider | Use |
|---|---|
| \`getRecords()\` | The records of the current page, already searched, filtered and sorted. |
| \`getColumns()\` | The columns, including the ones the user added, removed or moved in the column editor. |
| \`getSelectedRecordIds()\`, \`setSelectedRecordIds(ids)\` | The selection, which the ribbon loads its commands for. |
| \`onNewDataLoaded\` event | Fired when the records change: after a search, a page change or a refresh. |
| \`onRecordsSelected\` event | Fired when the selection changes. |
| \`onRecordColumnValueChanged\` event | Fired when a record's value changes. |

- Draw again on these events, as the example does.
- Keep what your view should remember, such as its scroll position, with \`useControlStateStore(stateKey)\`: it is kept per view and comes back with it. See [**State**](?path=/docs/datasetcontrol-state-overview--overview).
- Wrap the view in \`DatasetControl.EmptyRecords\` to show an empty state while there are no records.
- Every part works on any view. \`EditColumns\` changes the provider's columns, so it is only useful when your view shows the columns it is given.
`

const meta = {
    title: 'DatasetControl/Customization/Your own collection view',
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

export const ProductsAsAGallery: Story = {
    name: 'Products as a gallery',
    render: () => renderStory(<GalleryExample />),
    parameters: {
        docs: {
            description: {
                story: `An office furniture shop's products as a gallery of Fluent document cards. Switch views, search, page, and click cards to select them: the ribbon follows the selection as it does around a grid. Scroll the gallery, switch to *Seating* and back: it is scrolled where you left it, kept with \`useControlStateStore\`.`,
            },
        },
    },
}
