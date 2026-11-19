import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { TheOpeningPlanExample } from '../../../../concepts/guide/more-controls/theOpeningPlanExamples'

const STEP = 'The opening plan'

const DESCRIPTION = `
{{block: progress}}

Each opening is a plan of its own: tasks, the people on them, the work that waits on other work, and the dates that matter. This step adds the plan to the store's form, as a tree of tasks beside a timeline.

{{canvas: The opening plan}}

## How it works

The app is the one from [**On the map**](?path=/docs/concepts-guide-more-controls-on-the-map--overview), and only *StoreForm.tsx* changes: in **Code**, its new section carries \`{/* new: … */}\`, and *OpeningPlan.tsx* and *plans.ts* are new.

**A control inside a control.** The *Opening plan* section holds \`OpeningPlan\`, a \`TaskDatasetControl\` of the store's own: it loads the tasks of the store it is handed, and the \`TaskGrid\` and \`TaskGantt\` in its body draw them as a tree beside a timeline. What a task grid is and does: [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview).

Most of what the plan does comes from modules, as in [**Edit and save**](?path=/docs/concepts-guide-basics-edit-and-save--overview), and each step of the TaskGrid guide teaches a few of its lines:

| In *OpeningPlan.tsx* | Adds | Taught in |
|---|---|---|
| \`MemoryTaskStore\` over \`PLANS\`, \`PLAN_FIELD_MAPPING\` | The store's tasks as a tree | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| \`enableCreation\`, \`enableEditing\`, \`enableDeletion\`, \`TaskDatasetControl.Ribbon\`, \`createTaskEditingModule\`, \`createTaskDraggingModule\`, \`createRowSelectionModule\` | **New**, **Edit** and **Delete**, editing in the cells and dragging rows | [**Let users plan**](?path=/docs/controls-taskgrid-guide-basics-let-users-plan--overview) |
| \`views: PLAN_VIEWS\` | The *Opening plan* view and its columns | [**Views and the tree**](?path=/docs/controls-taskgrid-guide-basics-views-and-the-tree--overview) |
| \`TaskGantt.Split\`, \`TaskGantt\`, \`TaskGantt.ZoomSlider\`, the dates in \`PLAN_FIELD_MAPPING\`, \`createLibraryModule\`, \`createBarDraggingModule\`, \`createTaskDrawingModule\`, \`createTaskSelectionModule\` | The timeline beside the tree, with bars to drag and draw | [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview) |
| \`planModules\` and \`ganttModules\` | Which part each module goes in | [**How modules work**](?path=/docs/controls-taskgrid-guide-features-how-modules-work--overview) |
| \`createMemoryLookupManyModule\` | *Assigned to* and *Tags* | [**People and tags**](?path=/docs/controls-taskgrid-guide-features-people-and-tags--overview) |
| \`createMemoryDependenciesModule\`, \`createLinksModule\` | The work that waits on other work, and the arrows between bars | [**Dependencies and links**](?path=/docs/controls-taskgrid-guide-features-dependencies-and-links--overview) |
| \`createMemoryTaskChecklistModule\`, \`createMemoryCustomColumnsModule\`, \`DatasetControl.EditColumns\` | *Checklist*, and *Budget* and *Supplier* in **Edit columns** | [**Checklists and custom columns**](?path=/docs/controls-taskgrid-guide-features-checklists-and-custom-columns--overview) |
| \`createMemoryTemplatesModule\` | **New › From template** | [**Templates and the project**](?path=/docs/controls-taskgrid-guide-features-templates-and-the-project--overview) |
| \`createMemoryMarkersModule\`, \`createMemoryNonWorkingDaysModule\`, \`createTaskTooltipModule\` | The *Opening* line, the holidays and a tooltip on every bar | [**Dates on the timeline**](?path=/docs/controls-taskgrid-guide-features-dates-on-the-timeline--overview) |

## Try it

- Click *Porto Ribeira*: its plan is under its details, with the *Opening* line on its opening date.
- Drag the bar of *Plan the opening day* a week later: it now ends past the *Opening* line.
- Open the arrow beside **New**, point at **From template** and pick *Standard store opening*: a task of that name joins the plan, with the template's tasks under it and no dates yet.

## Remember

- Controls nest: the store's form holds a task grid of its own.
- The TaskGrid guide teaches every line of the plan.

Your app is complete. Each step after this one starts from it and changes one thing.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/More controls/The opening plan',
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

export const TheOpeningPlan: Story = {
    name: 'The opening plan',
    tags: ['!dev'],
    render: () => renderStory(<TheOpeningPlanExample />),
}
