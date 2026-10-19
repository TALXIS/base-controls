import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyRecordsExample, NotificationsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
Two parts tell the user about the records: \`DatasetControl.Notifications\` shows messages above them, such as the provider's load error, and \`DatasetControl.EmptyRecords\` says when there are none.

## Show messages

\`DatasetControl.Notifications\` shows the provider's load error, next to messages of your own, in the same notification bar as on [**Form**](?path=/docs/form-get-started--overview). Put it between the header and the body.

\`\`\`tsx
<DatasetControl.Notifications messages={[{ text: 'Deals are synced every night.', level: 'INFO' }]} />
\`\`\`

{{story: Show the provider's error}}

## Say when there is nothing to show

\`DatasetControl.EmptyRecords\` wraps what shows the records, and shows *No records found.* in its place while the provider has none, such as after a search that matches nothing. A grid has the same empty state built in, so it needs no wrapping.

\`\`\`tsx
<DatasetControl.Body>
    <DatasetControl.EmptyRecords>
        <DealList />
    </DatasetControl.EmptyRecords>
</DatasetControl.Body>
\`\`\`

{{story: Say when nothing matches}}

## Props

\`Notifications\`:

| Prop | Type | Default | Description |
|---|---|---|---|
| \`messages\` | \`INotificationMessage[]\` | None | Messages of your own: \`{ text, level }\`, with \`level\` one of \`'ERROR'\`, \`'WARNING'\` and \`'INFO'\`. |
| \`labels\` | \`Partial<IDatasetControlNotificationsLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`Partial<IDatasetControlNotificationsComponents>\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |

\`EmptyRecords\`:

| Prop | Type | Default | Description |
|---|---|---|---|
| \`children\` | \`ReactNode\` | None | What shows the records, drawn while there are some. |
| \`labels\` | \`Partial<IEmptyRecordsLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`Partial<IEmptyRecordsUiComponents>\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('notifications')\` returns the notifications part while it is rendered. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

| Member | Description |
|---|---|
| \`getMessages()\` | The provider's load error, while there is one. Your own \`messages\` are not in it. |
| \`events\` | \`onNotificationsChanged\`, whenever the provider fails or loads. |

\`EmptyRecords\` has no part to reach: read \`provider.getRecords()\` instead.
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
    name: "Show the provider's error",
    render: () => renderStory(<NotificationsExample />),
    parameters: {
        docs: {
            description: {
                story: `A message of your own, and the provider's error once it fails to load, grouped under a summary. Try: press *Break the connection*, then open the summary.`,
            },
        },
    },
}

export const NothingMatches: Story = {
    name: 'Say when nothing matches',
    render: () => renderStory(<EmptyRecordsExample />),
    parameters: {
        docs: {
            description: {
                story: `A plain list of the deal names, wrapped in \`EmptyRecords\`. Try: search for something that is not there.`,
            },
        },
    },
}
