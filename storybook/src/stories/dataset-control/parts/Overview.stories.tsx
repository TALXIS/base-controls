import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ShowcaseExample } from '../../../dataset-control/examples/getStartedExamples'

const DESCRIPTION = `Every part works on the provider \`onLoad\` returned, and shows once it is loaded. Leave out the parts you don't need; where to put the ones you keep is on [**Layout**](?path=/docs/datasetcontrol-layout-overview--overview).

| Part | What it adds | Details |
|---|---|---|
| \`ViewSwitcher\` | The current view, and the list of views to switch to | [**Views**](?path=/docs/datasetcontrol-parts-views--overview) |
| \`Ribbon\` | The commands for the selected records | [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview) |
| \`QuickFind\` | A search across the provider's quick find columns | [**Quick find**](?path=/docs/datasetcontrol-parts-quick-find--overview) |
| \`EditColumns\` | A button that opens the column editor | [**Edit columns**](?path=/docs/datasetcontrol-parts-edit-columns--overview) |
| \`Notifications\` | The provider's errors, and messages of your own | [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview) |
| \`EmptyRecords\` | An empty state in place of the records when there are none | [**Notifications and empty records**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview) |
| \`Pagination\` | First, previous and next page | [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview) |
| \`PageSizeSwitcher\` | The records on the page, and the page size | [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview) |

Every part takes \`labels\`, for its strings, and \`components\`, to replace what it draws: see [**Localization**](?path=/docs/datasetcontrol-localization-overview--overview) and [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). A part of your own is on [**Extending**](?path=/docs/datasetcontrol-customization-extending--overview).

{{story: Every part}}
`

const meta = {
    title: 'DatasetControl/Parts/Overview',
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

export const EveryPart: Story = {
    name: 'Every part',
    render: () => renderStory(<ShowcaseExample />),
    parameters: {
        docs: {
            description: {
                story: `The sales pipeline from **Get started**, with every part.`,
            },
        },
    },
}
