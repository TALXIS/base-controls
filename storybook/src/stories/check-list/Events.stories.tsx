import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { EventsCheckListExample } from '../../check-list/EventsCheckListExample'
import { docsPageWithExample } from '../docsPageWithExample'

const DESCRIPTION = `
The checklist saves every change itself, so nothing here is required to make it work. Subscribe when you want to mirror those changes somewhere else — persist the list, sync a counter, log what happened.

The example below logs every event as it fires. Rename an item, tick one, drag one, add one, delete one, and watch the order they arrive in. Flip **Code** to change which ones it listens to.

## The events

One prop per change, all optional.

| Prop | Fires when | Receives |
|------|------------|----------|
| \`onItemCreated\` | An item was added in the bottom row. | The new item, as a raw record. |
| \`onItemDeleted\` | An item was deleted. | Its id. |
| \`onItemMoved\` | An item was dragged to a new position. | Its id. |
| \`onItemCompletionChanged\` | An item was ticked or unticked. | Its id, and whether it is now finished. |
| \`onItemSaved\` | Anything was saved — a rename, a tick, a reorder, a new item. | The save result: \`recordId\`, \`success\`, \`fields\`. |
| \`onDataChanged\` | The list changed and the change stuck. | Every item as it now stands. |
| \`onError\` | Something failed. The checklist still shows its own dialog. | The error, and a message. |

\`\`\`tsx
<CheckList
    onInitialize={onInitialize}
    onDataChanged={items => saveMyList(items)}
    onItemCompletionChanged={(itemId, isCompleted) => syncOne(itemId, isCompleted)}
    onError={(error, message) => logger.error(message, error)} />
\`\`\`

### Which one to persist from

\`onDataChanged\`. It arrives after every kind of change with the whole list, so a host that stores the items needs nothing else — the item-specific events are for reacting to *what* happened, not for keeping a copy.

Two things worth knowing about it:

- A rename raises \`onItemSaved\` and \`onDataChanged\` and no item-specific event, because a cell edit is committed by the grid rather than by the checklist.
- A failed save raises \`onItemSaved\` with \`success: false\` and **no** \`onDataChanged\`, since nothing stuck.

## The api

\`onReady\` hands over a handle for the things events cannot express:

\`\`\`tsx
onReady={api => {
    //the items, including edits that have not been saved yet
    api.getData()
    //the same events as the props, subscribed to imperatively
    api.getEvents().addEventListener('onDataChanged', items => saveMyList(items))
}}
\`\`\`

| Method | Description |
|--------|-------------|
| \`getData()\` | The current items, including unsaved edits. A copy — writing to it changes nothing. |
| \`getEvents()\` | The checklist's events, to subscribe to with \`addEventListener\`. |

\`onReady\` fires as soon as the checklist is built, which is **before** its items have loaded — \`getData()\` in it comes back empty, as the log in the example shows. Read the items from \`onDataChanged\`, or from \`getData()\` any time later.

## Where to go next

- [**Get started**](?path=/story/checklist-get-started--overview) — \`onInitialize\`, the props, the field mapping and the labels.
                `

const meta = {
    title: 'Checklist/Reacting to changes',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: docsPageWithExample(DESCRIPTION),
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<EventsCheckListExample />),
}
