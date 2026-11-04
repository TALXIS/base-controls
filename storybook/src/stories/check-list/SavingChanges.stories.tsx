import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { SaveLogExample } from '../../check-list/checkListExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
A checklist stores nothing itself: every tick, rename, drag, new item and delete changes a record of its provider, and the provider saves it. Where the list ends up is the provider's choice, in memory, in Dataverse or behind your own API. Try it below: tick, drag, add and delete items, and watch the log fill with what the provider was asked to save.

{{canvas: Watch what the checklist saves}}

## What it changes

| When the user | The checklist |
|---|---|
| Ticks or unticks an item | Sets \`completed\` to \`true\` or \`false\`. |
| Renames an item, or edits another column | Sets the value, as any grid cell does. |
| Drags an item | Sets \`stackRank\` to a rank between its new neighbours. |
| Adds an item in the bottom row | Creates a record with \`provider.newRecord()\` after the last item. |
| Deletes an item | Asks for confirmation, then calls \`provider.deleteRecords()\`. |

With the default auto-save, each change saves its record at once; with \`createEditingModule()\` on its own, changes wait until you save them, as on [**Editing**](?path=/docs/controls-grid-modules-editing--overview). A delete always goes to the provider straight away.

## Save to your API

The provider decides where a save goes. Extend it and override \`onRecordSave\` and \`onRecordsDelete\`, as under *Your own provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview); \`record.isNew()\` tells an item added in the bottom row from one that existed.
`

const meta = {
    title: 'Controls/Checklist/Saving changes',
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
                story: `The provider's \`onAfterRecordSaved\` and \`onAfterRecordsDeleted\` events, logged beside the list.`,
            },
        },
    },
}
