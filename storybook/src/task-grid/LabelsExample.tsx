import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const LABELS_CODE = `/** Any key you leave out keeps its English default. */
const labels = {
    new: 'Add task',
    deleteSelected: 'Remove',
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    labels={labels} />
`

/** The grid with a couple of labels overridden, so the reader can try more. */
export const LabelsExample = () => <TaskGridExampleRunner seedCode={LABELS_CODE} />
