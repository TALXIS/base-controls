import type { Meta, StoryObj } from '@storybook/react'
import { gridDocsPage } from '../../grid/gridDocsPage'

const DESCRIPTION = `
The checklist changes the records of its provider and asks the provider to save them. To store the list in your own backend, give the checklist a provider that saves there.

## What the checklist changes

| When the user | The checklist |
|---|---|
| Ticks or unticks an item | Sets \`completed\` to \`true\` or \`false\`. |
| Renames an item, or edits another column | Edits the cell, as any grid does. |
| Drags an item | Sets \`stackRank\` to a rank between the item's new neighbours. |
| Names an item in the bottom row | Adds a record with \`provider.newRecord()\` after the last item and sets its \`stackRank\`. |
| Deletes an item | Asks for confirmation, then calls \`provider.deleteRecords([recordId])\`. |

With auto-save, every change except a delete is saved as soon as it is made; a delete always goes to the provider. Without auto-save, changes stay on the records until you save them. See *Saving* on [**Editing**](?path=/docs/grid-modules-editing--overview).

## Save to your backend

Extend a provider and override the methods that persist records:

\`\`\`ts
import { IRecord, IRecordSaveOperationResult, MemoryDataProvider } from '@talxis/client-libraries'

class LaunchPlanProvider extends MemoryDataProvider {
    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        await api.saveItem(record.getRawData())
        return super.onRecordSave(record)
    }

    public async onRecordsDelete(recordIds: string[]) {
        await api.deleteItems(recordIds)
        return super.onRecordsDelete(recordIds)
    }
}
\`\`\`

- \`onRecordSave\` saves one record and resolves \`{ recordId, success, fields, errors? }\`. \`record.isNew()\` tells a new item from an existing one.
- \`onRecordsDelete\` deletes records and resolves \`{ success, results }\`, one \`{ recordId, success }\` per record. A record whose delete fails stays in the list.
- Calling \`super\` keeps the provider's own copy of the records in step with your backend.
- \`MemoryDataProvider\` suits records you load yourself. To load them from your backend too, extend \`DataProvider\` and implement its data methods.

## React to changes

The grid's events are available on \`CheckList\`. The ones most often used with a checklist are:

- \`onRecordValueChanged(record, columnName, newValue)\`, after a tick, a rename, a drag or a new item.
- \`onAfterRecordSaved(result)\`, once the provider has saved a record or refused it.

Deletes raise no event; handle them in \`onRecordsDelete\`. Every event is listed under *Events* on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview).
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

//a docs page needs a story to render on
export const Overview: Story = {
    name: 'Overview',
    render: () => null,
}
