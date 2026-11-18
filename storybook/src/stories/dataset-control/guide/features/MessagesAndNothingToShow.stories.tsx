import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../dataset-control/guide/datasetControlGuide'
import { ListOfYourOwnExample, MessagesExample } from '../../../../dataset-control/guide/features/messagesAndNothingToShowExamples'

const STEP = 'Messages and nothing to show'

const DESCRIPTION = `
{{block: progress}}

The team should know that the deals sync every night, and see when the deals service is down. When a search finds nothing, the list says so.

{{canvas: Messages and nothing to show}}

## How it works

This step puts \`DatasetControl.Notifications\` between the header and the body of [**Choose the columns**](?path=/docs/controls-datasetcontrol-guide-features-choose-the-columns--overview), with one message of your own, and adds **Break the connection**, which stands in for the deals service failing. In **Code**, the new lines carry \`//new:\`.

**Your messages.** \`messages\` takes \`{ text, level, onDismiss? }\`: \`level\` is \`'ERROR'\`, \`'WARNING'\` or \`'INFO'\`, and \`onDismiss\` adds a close button that calls it.

- \`text\` is drawn as HTML, so escape anything you did not write; the provider's error is escaped.
- The most severe level among the messages sets the bar's colour.
- Two or more messages fold under a summary, which opens them on a click.

**A later load that fails.** A load that fails as the control mounts takes the place of the parts, as in [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview). A later load of the provider, such as a search, another page or **Refresh**, leaves the parts in place: the provider's error shows in the notifications, beside your messages, and goes once a load succeeds. **Break the connection** calls \`provider.setError(true, message)\`, as a provider does when a load fails. Every failure, and where it shows, is under *Failures* on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

**Nothing to show.** A grid draws an empty state of its own when there are no records: see Grid's [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview). Anything else in the body goes inside \`DatasetControl.EmptyState\`, which shows *No records found.* in its place while the provider has no records, and keeps it while the provider loads. To change the text, see [**Localization**](?path=/docs/concepts-localization--overview).

## A list of your own

A body that is not a grid: the deal names in a list of your own, wrapped in \`EmptyState\`.

{{canvas: A list of your own}}

## Try it

- Press **Break the connection**: the bar turns red and folds two messages under a summary. Click the summary: the sync message, and *The deals service is not reachable.*
- Search for *Contoso*: the search loads the deals again, and the error goes.
- Search for *zzz*: the grid shows its empty state, *No records found.*
- In **Code**, write \`<b>every night</b>\` in the message: the words show in bold.
- In *A list of your own*, search for *zzz*: *No records found.* takes the place of the list.

## Remember

- One bar holds your messages and the provider's errors.
- A later load that fails shows in the bar, and the next load clears it.
- A grid has its own empty state; wrap anything else in \`EmptyState\`.

{{block: navigation}}
`

const meta = {
    title: 'Controls/DatasetControl/Guide/Features/Messages and nothing to show',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const MessagesAndNothingToShow: Story = {
    name: 'Messages and nothing to show',
    tags: ['!dev'],
    render: () => renderStory(<MessagesExample />),
}

export const AListOfYourOwn: Story = {
    name: 'A list of your own',
    tags: ['!dev'],
    render: () => renderStory(<ListOfYourOwnExample />),
}
