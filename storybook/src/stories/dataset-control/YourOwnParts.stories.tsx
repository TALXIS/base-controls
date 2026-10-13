import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { APartOfYourOwnExample } from '../../../dataset-control/examples/extendingExamples'
import { GalleryExample } from '../../../dataset-control/examples/collectionViewExamples'
import { WatchControlExample } from '../../../dataset-control/examples/propsAndEventsExamples'

const DESCRIPTION = `Anything you put inside \`DatasetControl\` can work with the provider and drive the control: a part of your own in the header or footer, or something other than a grid in the body.

## A part of your own

A part of your own is a component placed in a region.

- \`useDataProviderEvents(events)\` returns the provider and draws the component again on each of its \`events\`.
- \`useDatasetControl()\` returns the control, to switch the view, reload it or reach a built-in part through \`control.parts\`.

\`\`\`tsx
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + provider.getRecordsMap()[id].getValue('value'), 0)
    return <Text>Selected: {total}</Text>
}

const Shortcuts = () => {
    const control = useDatasetControl()
    return <>
        <DefaultButton text='Won deals' onClick={() => control.loadView('won')} />
        <DefaultButton text='Edit columns' onClick={() => control.parts.find('editColumns')?.open()} />
    </>
}
\`\`\`

A built-in part is in \`control.parts\` only while it is rendered, so reach it with \`find\`. Everything the control and its parts offer is on [**API**](?path=/docs/datasetcontrol-api-datasetcontrol--overview).

{{story: A part of your own}}

To make a part look like the built-in ones, draw it with \`DatasetControl.Ui\`: see [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview).

## From outside the control

\`onReady\` hands the same control to the code that mounts it, before the first load. Subscribe to its \`events\` there.

\`\`\`tsx
const onReady = (control: IDatasetControl) => {
    control.events.addEventListener('onLoaded', () => setViewInUrl(control.getViewId()))
}

<DatasetControl onLoad={loadDeals} onReady={onReady}>...</DatasetControl>
\`\`\`

{{story: Watch the control}}

## Your own collection view

The parts work on the provider, not on the grid, so anything that shows records can go in \`Body\`: a list, cards, a calendar or a chart.

| Provider | What it gives you |
|---|---|
| \`getRecords()\` | The records of the page, already searched, filtered and sorted. |
| \`getColumns()\` | The columns, as the user set them in Edit columns. |
| \`getSelectedRecordIds()\`, \`setSelectedRecordIds(ids)\` | The selection, which the ribbon follows. |
| \`onNewDataLoaded\` | Raised when the records change: after a search, a page change or a refresh. |
| \`onRecordsSelected\` | Raised when the selection changes. |
| \`onRecordColumnValueChanged\` | Raised when a record's value changes. |

- Pass the events your view shows to \`useDataProviderEvents\`.
- Keep what your view should remember, such as its scroll, with \`useControlStateStore(stateKey)\`, which keeps it per view. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview).
- Wrap the view in \`DatasetControl.EmptyRecords\` for an empty state.
- \`EditColumns\` changes the provider's columns, so it is useful only when your view shows them.

{{story: Products as a gallery}}
`

const meta = {
    title: 'DatasetControl/Customization/Your own parts',
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

export const APartOfYourOwn: Story = {
    name: 'A part of your own',
    render: () => renderStory(<APartOfYourOwnExample />),
    parameters: {
        docs: {
            description: {
                story: `Select deals to see their total value in the footer. The buttons in the header switch the view, reload it, search and open the column editor.`,
            },
        },
    },
}

export const WatchTheControl: Story = {
    name: 'Watch the control',
    render: () => renderStory(<WatchControlExample />),
    parameters: {
        docs: {
            description: {
                story: `Every event of the control, newest first. Switch the view, press *Show won deals*, which calls \`loadView('won')\`, or *Remount* to see \`onDestroyed\` and a fresh \`onReady\`.`,
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
