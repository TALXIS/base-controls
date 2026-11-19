import { createGuide } from '../../grid/showcase/Guide'

type TaskGridStage = 'Basics' | 'Features' | 'Your data' | 'Advanced'

export const { GuideProgress, GuideNavigation, GuideMap } = createGuide<TaskGridStage>({
    name: 'TaskGrid guide',
    idPrefix: 'controls-taskgrid-guide',
    stages: [
        { name: 'Basics', iconName: 'Education', promise: 'Put a task grid on a page, let users plan in it, organise it with views, and add the timeline.' },
        { name: 'Features', iconName: 'Puzzle', promise: 'Add what a plan needs beside its tasks: people, dependencies, checklists, templates and the dates that matter.' },
        { name: 'Your data', iconName: 'Database', promise: 'Keep the tasks in Dataverse, in TALXIS or behind your own API.' },
        { name: 'Advanced', iconName: 'Code', promise: 'Draw every part your way, drive the plan from your code and write features of your own.' },
    ],
    steps: [
        { stage: 'Basics', title: 'Your first task grid', text: 'The office move as a tree: your rows, a store and a field mapping.' },
        { stage: 'Basics', title: 'Let users plan', text: 'Create, edit, drag and delete tasks, and keep finished work safe.' },
        { stage: 'Basics', title: 'Views and the tree', text: 'Views, search that keeps its context, the flat list and starting from one task.' },
        { stage: 'Basics', title: 'The timeline', text: 'The same plan on a Gantt chart, moved and drawn with the mouse.' },
        { stage: 'Features', title: 'How modules work', text: 'Where a module goes, which backend it reads and when it loads.' },
        { stage: 'Features', title: 'People and tags', text: 'Who works on each task, and what kind of work it is.' },
        { stage: 'Features', title: 'Dependencies and links', text: 'Work that waits on other work, counted in the grid and drawn on the timeline.' },
        { stage: 'Features', title: 'Checklists and custom columns', text: 'How far each task has got, and columns the team adds itself.' },
        { stage: 'Features', title: 'Templates and the project', text: 'Plan repeated work in one go, and show the project the plan belongs to.' },
        { stage: 'Features', title: 'Dates on the timeline', text: 'Milestones, holidays, today and a tooltip on every bar.' },
        { stage: 'Your data', title: 'Where tasks are kept', text: 'Memory, Dataverse or TALXIS, and exactly what the store is asked.' },
        { stage: 'Your data', title: 'Your own backend', text: 'A store over your own API, stores for the modules, and dates your backend changes.' },
        { stage: 'Advanced', title: 'Make it yours', text: 'Colours by status, people in cells, your own tooltip and content on the bars.' },
        { stage: 'Advanced', title: 'From your code', text: 'The task runtime, the events of every change, and ribbon commands of your own.' },
        { stage: 'Advanced', title: 'Write a module', text: 'Features of your own for the tasks, the grid and the Gantt.' },
    ],
    reference: { title: 'Reference', text: 'Every prop, module parameter, runtime member, field mapping key and slot of the task grid.', iconName: 'Table', href: '?path=/docs/controls-taskgrid-reference--overview' },
})
