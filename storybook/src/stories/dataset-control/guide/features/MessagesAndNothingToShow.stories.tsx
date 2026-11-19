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

This step puts \`DatasetControl.Notifications\` between the header and the body of [**Choose the columns**](?path=/docs/controls-datasetcontrol-guide-features-choose-the-columns--overview), adds a message of your own from \`onSetup\`, and adds **Break the connection**, which stands in for the deals service failing. In **Code**, the new lines carry \`//new:\`.

**Your messages.** \`DatasetControl.Notifications\` draws the bar and provides the control's \`notifications\` part, which holds the messages the bar shows. \`onSetup\` gets the control before its parts are drawn, so \`showSyncMessage\` waits for the bar with \`control.parts.observe('notifications', callback)\`: the callback adds the message each time a bar is drawn. Each load draws a new bar, so the message comes back on the next load even after the user closes it. Once the control is drawn, such as in \`onReady\` or a button's \`onClick\`, \`control.notifications\` returns the part itself.

| Message key | Here |
|---|---|
| \`text\` | Drawn as HTML, so escape anything you did not write. |
| \`level\` | \`'INFO'\`; \`'ERROR'\`, \`'WARNING'\` and \`'SUCCESS'\` are the others, and the most severe one sets the bar's colour. |
| \`id\` | \`'sync'\`, which \`notifications.remove('sync')\` finds it by; a message added later with the same \`id\` takes its place. |
| \`onDismiss\` | Puts a close button on the message, which calls it; here it removes the message. |

Every member of the part, and how the bar folds several messages, is under *Messages* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

**A later load that fails.** A load that fails as the control mounts takes the place of the parts, as in [**When loading fails**](?path=/docs/controls-datasetcontrol-guide-basics-when-loading-fails--overview). A later load of the provider, such as a search, another page or **Refresh**, leaves the parts in place: the control adds the provider's error to the bar, beside your messages, and removes it once a load succeeds. **Break the connection** calls \`provider.setError(true, message)\`, as a provider does when a load fails. Every failure, and where it shows, is under *Failures* on [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview).

**Nothing to show.** A grid draws an empty state of its own when there are no records: see Grid's [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview). Anything else in the body goes inside \`DatasetControl.EmptyState\`, which shows *No records found.* in its place while the provider has no records, and keeps it while the provider loads. To change the text, see [**Localization**](?path=/docs/concepts-localization--overview).

## A list of your own

A body that is not a grid: the deal names in a list of your own, wrapped in \`EmptyState\`.

{{canvas: A list of your own}}

## Try it

- Press **Break the connection**: the bar turns red and folds two messages under a summary. Click the summary: the sync message, and *The deals service is not reachable.*
- Search for *Contoso*: the search loads the deals again, and the error goes.
- Close the sync message with its **×**. Switch to *All deals*: the new load draws a new bar, with the message in it.
- In **Code**, set \`level\` to \`'SUCCESS'\`: the bar turns green.
- Search for *zzz*: the grid shows its empty state, *No records found.*
- In *A list of your own*, search for *zzz*: *No records found.* takes the place of the list.

## Remember

- One bar holds your messages and the provider's errors, through the control's \`notifications\` part.
- Add a message from \`onSetup\` with \`control.parts.observe\`; its \`id\` lets you remove or replace it.
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
