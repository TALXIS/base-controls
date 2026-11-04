import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ChecklistExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
The checklist module shows how far each task's checklist is done, as *done/total* in a *Checklist* column. The column is read-only: checklists are edited where they are kept, such as in the task's form. Try it below: pass \`items: {}\` in **Code** to empty every cell.

{{canvas: Show checklist progress}}

## Options

| Option | Default | Description |
|---|---|---|
| \`reloadOnEditorClosed\` | \`false\`; \`true\` for TALXIS | Reads a task's items again once its form closes. |
| \`components\` | Defaults | See *Changing how it looks* below. |

## Where checklists are kept

| Factory | Keeps the checklists |
|---|---|
| \`createMemoryChecklistModule\` | In memory. \`items\` holds each task's items, by task id: \`{ id, name, isCompleted }\`. |
| \`createTalxisChecklistModule\` | As JSON in each TALXIS task's \`talxis_checklistjson\` column, read with the tasks. |
| \`createChecklistModule\` | In a store of yours: \`onCreateStore\` returns an \`IChecklistStore\` with \`onLoadItems(taskIds)\`, which returns the items by task id. A task left out has none. |

A task without items shows an empty cell.

## Changing how it looks

Every checklist factory takes \`components\`, read at mount. How slots work: [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`progress\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | \`ChecklistProgressComponents\` | The *done/total* in a cell |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Every task module, and a checklist from a store of your own.' },
    { title: 'Dependencies', iconName: 'Link', href: '?path=/docs/controls-taskgrid-modules-dependencies--overview', text: 'Which tasks wait on which, counted in the grid.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Checklist',
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

export const ShowChecklistProgress: Story = {
    name: 'Show checklist progress',
    render: () => renderStory(<ChecklistExample />),
}
