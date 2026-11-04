import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ChecklistExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
The checklist module shows how far each task's checklist is done, as *done/total* in a *Checklist* column. The column is read-only: checklists are edited where they are kept, such as in the task's form.

{{story: Show checklist progress}}

## Where checklists are kept

| Factory | Keeps the checklists |
|---|---|
| \`createMemoryChecklistModule\` | In memory. \`items\` holds each task's items, by task id: \`{ id, name, isCompleted }\`. |
| \`createTalxisChecklistModule\` | As JSON in each TALXIS task's \`talxis_checklistjson\` column, read with the tasks. |
| \`createChecklistModule\` | In a store of yours: \`onCreateStore\` returns an \`IChecklistStore\` with \`onLoadItems(taskIds)\`, which returns the items by task id. A task left out has none. |

A task without items shows an empty cell.

## Options

| Option | Default | Description |
|---|---|---|
| \`reloadOnEditorClosed\` | \`false\`; \`true\` for TALXIS | Reads a task's items again once its form closes. |
| \`components\` | Defaults | See *Changing how it looks* below. |

## Changing how it looks

Every checklist factory takes \`components\`, read at mount. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`progress\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`ChecklistProgressComponents\` | The *done/total* in a cell |
`

const meta = {
    title: 'Controls/TaskGrid/Modules/Checklist',
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

export const ShowChecklistProgress: Story = {
    name: 'Show checklist progress',
    render: () => renderStory(<ChecklistExample />),
    parameters: {
        docs: {
            description: {
                story: `Checklists in memory, ticked as far as each task has come. Try: in **Code**, pass \`items: {}\` and every cell is empty.`,
            },
        },
    },
}
