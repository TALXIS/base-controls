import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { EmptyStateExample, NotificationsExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
\`DatasetControl.Notifications\` shows messages in a bar above the records: your own, and the provider's error when a load fails. \`DatasetControl.EmptyState\` takes the place of the records when there are none. Try it below: press **Break the connection**, then open the summary.

{{canvas: Show the provider's error}}

## Show messages

Put \`DatasetControl.Notifications\` between the header and the body. It draws the provider's load error next to messages of your own.

## Say when there is nothing to show

\`DatasetControl.EmptyState\` wraps what shows the records, and shows *No records found.* in its place while the provider has loaded no records. A grid has the same empty state built in, so it needs no wrapping.

{{story: Say when nothing matches}}

## How it behaves

- **HTML:** a message's \`text\` is drawn as HTML, so escape anything you did not write; the provider's error is escaped.
- **Colour:** the most severe level among the messages sets the bar's colour.
- **Several messages:** two or more fold under a summary that opens them; its text is the label \`notificationMessageBar.groupedNotificationsSummary\`.
- **Load error:** shows while the provider's last load failed, and goes once it loads again.
- **Empty state:** the children stay while the provider loads, so a load does not flash the empty state.

## Props

### Notifications

| Prop | Type | Default | Description |
|---|---|---|---|
| \`messages\` | \`INotificationMessage[]\` | None | Messages of your own: \`{ text, level }\`, with \`level\` one of \`'ERROR'\`, \`'WARNING'\` and \`'INFO'\`. |
| \`components\` | \`Partial<IDatasetControlNotificationsComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

### EmptyState

| Prop | Type | Default | Description |
|---|---|---|---|
| \`children\` | \`ReactNode\` | None | What shows the records. |
| \`components\` | \`Partial<IDatasetControlUiEmptyStateComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('notifications')\` returns the notifications part once it is drawn: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). \`EmptyState\` has no part to reach: read \`provider.getRecords()\` instead.

| Member | Does |
|---|---|
| \`getMessages()\` | The provider's load error, while there is one; your own \`messages\` are not in it. |
| \`events\` | \`onNotificationsChanged\`, whenever the provider fails or loads. |

**Strings:** \`NOTIFICATION_MESSAGE_BAR_LABELS\`, keys \`notificationMessageBar.*\`, and \`EMPTY_STATE_LABELS\`, keys \`emptyState.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'Which failures show here, and which replace the parts or open a dialog.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Show the records your own way, wrapped in the empty state.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Reword the summary and the empty state.' },
]

const meta = {
    title: 'Controls/DatasetControl/Parts/Notifications and empty state',
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

export const TheDealsServiceIsUnreachable: Story = {
    name: "Show the provider's error",
    render: () => renderStory(<NotificationsExample />),
}

export const NothingMatches: Story = {
    name: 'Say when nothing matches',
    render: () => renderStory(<EmptyStateExample />),
    parameters: {
        docs: {
            description: {
                story: `A list of the deals of your own, wrapped in \`EmptyState\`. Try: search for *zzz*.`,
            },
        },
    },
}
