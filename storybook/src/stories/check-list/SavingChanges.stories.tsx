import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { SaveLogExample } from '../../check-list/checkListExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
The checklist changes the records of its provider and asks the provider to save them. This page lists what it changes and when; to store the list in your own backend, give it a provider that saves there.

{{story: Watch what the checklist saves}}

## What the checklist changes

| When the user | The checklist |
|---|---|
| Ticks or unticks an item | Sets \`completed\` to \`true\` or \`false\`. Read back, the value is \`'1'\` or \`'0'\`. |
| Renames an item, or edits another column | Sets the value, as any grid cell does. |
| Drags an item | Sets \`stackRank\` to a rank between the item's new neighbours. |
| Names an item in the bottom row | Adds a record with \`provider.newRecord()\` after the last item, and sets its \`stackRank\`. |
| Deletes an item | Asks for confirmation, then calls \`provider.deleteRecords([recordId])\`. |

- With the default auto-save, every change but a delete saves its record at once. Without auto-save, changes stay on the records until you save them: see *Save* on [**Editing**](?path=/docs/grid-modules-editing--overview).
- A delete goes to the provider straight away, with or without auto-save. The delete button is there only while the editing module is on.

## Save to your backend

The provider decides where a save goes. To send the checklist's changes to your API, extend the provider and override \`onRecordSave\` and \`onRecordsDelete\`: see *Your own provider* on [**Data providers**](?path=/docs/data-providers--overview). \`record.isNew()\` tells an item added in the bottom row from one that existed.

## React to changes

Listen on the provider, or through the grid's event props, which \`CheckList\` takes as well:

| Event | When it fires |
|---|---|
| \`onRecordValueChanged(record, columnName, newValue)\` | After a tick, a rename, a drag or a new item. |
| \`onAfterRecordSaved(result)\` | Once the provider has saved a record, or refused it. |
| \`onAfterRecordsDeleted(results)\` | After a delete, on the provider. |

Every provider event is under *Events* on [**Data providers**](?path=/docs/data-providers--overview), and every grid event on [**Props and events**](?path=/docs/grid-props-and-events--overview).
`

const meta = {
    title: 'Checklist/Saving changes',
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

export const WatchWhatTheChecklistSaves: Story = {
    name: 'Watch what the checklist saves',
    render: () => renderStory(<SaveLogExample />),
    parameters: {
        docs: {
            description: {
                story: `The provider's \`onAfterRecordSaved\` and \`onAfterRecordsDeleted\` events, logged beside the list. Try: tick an item, drag one, add one and delete one.`,
            },
        },
    },
}
