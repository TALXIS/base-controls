import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const BASIC_TASK_GRID_CODE = `const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor} />
`

/** The plainest possible grid: the two required props and nothing else. Editable like every example. */
export const BasicTaskGridExample = () => <TaskGridExampleRunner seedCode={BASIC_TASK_GRID_CODE} />
