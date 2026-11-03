import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyRecordsExample, NotificationsExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
Two parts tell the user about the records. \`DatasetControl.Notifications\` shows messages above them, such as the provider's load error, and \`DatasetControl.EmptyRecords\` says when there are none.

## Show messages

Put \`DatasetControl.Notifications\` between the header and the body. It draws the provider's load error next to messages of your own, in the same notification bar as on [**Form**](?path=/docs/controls-form-get-started--overview).

{{story: Show the provider's error}}

## Say when there is nothing to show

\`DatasetControl.EmptyRecords\` wraps what shows the records, and shows *No records found.* in its place while the provider has loaded no records. A grid has the same empty state built in, so it needs no wrapping.

{{story: Say when nothing matches}}

## How it behaves

- **HTML:** a message's \`text\` is drawn as HTML, so escape anything you didn't write; the provider's error is escaped for you.
- **Colour:** the most severe level among the messages sets the bar's colour.
- **Several messages:** two or more fold under a summary that opens them.
- **Load error:** shows while the provider's last load failed, and goes once it loads again.
- **Empty records:** the children stay while the provider loads, so a load does not flash the empty state.

## Props

### Notifications

| Prop | Type | Default | Description |
|---|---|---|---|
| \`messages\` | \`INotificationMessage[]\` | None | Messages of your own: \`{ text, level }\`, with \`level\` one of \`'ERROR'\`, \`'WARNING'\` and \`'INFO'\`. |
| \`components\` | \`Partial<IDatasetControlNotificationsComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

### EmptyRecords

| Prop | Type | Default | Description |
|---|---|---|---|
| \`children\` | \`ReactNode\` | None | What shows the records. |
| \`components\` | \`Partial<IEmptyRecordsUiComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('notifications')\` returns the notifications part once it is drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). \`EmptyRecords\` has no part to reach: read \`provider.getRecords()\` instead.

| Member | Does |
|---|---|
| \`getMessages()\` | The provider's load error, while there is one; your own \`messages\` are not in it. |
| \`events\` | \`onNotificationsChanged\`, whenever the provider fails or loads. |

**Strings:** \`DATASET_CONTROL_NOTIFICATIONS_LABELS\`, keys \`notifications.*\`, and \`EMPTY_RECORDS_LABELS\`, keys \`emptyRecords.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).
`

const meta = {
    title: 'Controls/DatasetControl/Parts/Notifications and empty records',
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
                story: `A message of your own, joined by the provider's error once it fails to load. Try: press *Break the connection*, then open the summary.`,
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
                story: `A list of the deals of your own, wrapped in \`EmptyRecords\`. Try: search for something that is not there.`,
            },
        },
    },
}
