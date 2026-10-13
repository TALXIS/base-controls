import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyRecordsExample, NotificationsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `## Notifications

\`DatasetControl.Notifications\` shows the provider's load error, next to the \`messages\` you pass, in the same notification bar as on [**Form**](?path=/docs/form-get-started--overview). Put it between the header and the body.

\`\`\`tsx
<DatasetControl.Notifications messages={[{ text: 'Deals are synced every night.', level: 'INFO' }]} />
\`\`\`

A message is \`{ text, level }\`, with \`level\` one of \`'ERROR'\`, \`'WARNING'\` and \`'INFO'\`. All its props are on [**Parts**](?path=/docs/datasetcontrol-api-parts--overview) of the API.

{{story: The deals service is unreachable}}

## Empty records

\`DatasetControl.EmptyRecords\` wraps what shows the records, and shows *No records found.* in its place while the provider has none, such as after a search that matches nothing. A grid has the same empty state built in, so it needs no wrapping.

\`\`\`tsx
<DatasetControl.Body>
    <DatasetControl.EmptyRecords>
        <DealList />
    </DatasetControl.EmptyRecords>
</DatasetControl.Body>
\`\`\`

All its props are on [**Parts**](?path=/docs/datasetcontrol-api-parts--overview) of the API.

{{story: Nothing matches}}
`

const meta = {
    title: 'DatasetControl/Parts/Notifications and empty records',
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

export const TheDealsServiceIsUnreachable: Story = {
    name: 'The deals service is unreachable',
    render: () => renderStory(<NotificationsExample />),
    parameters: {
        docs: {
            description: {
                story: `An information message of your own. Press *Break the connection*, and the provider's error joins it, with a summary that opens both.`,
            },
        },
    },
}

export const NothingMatches: Story = {
    name: 'Nothing matches',
    render: () => renderStory(<EmptyRecordsExample />),
    parameters: {
        docs: {
            description: {
                story: `A plain list of the deal names. Search for something that is not there.`,
            },
        },
    },
}
