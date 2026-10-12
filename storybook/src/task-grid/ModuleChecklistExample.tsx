import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `data` come from the sandbox. */
export const MODULE_CHECKLIST_CODE = `/** The features this grid runs with. Anything not listed here is off. */
const features: ITaskGridFeatures = {
    checklist: createChecklistModule({
        //where the items are read from
        onCreateStrategy: ({ services }) => new MemoryChecklistStrategy({ items: data.checklist, services }),
    }),
}

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    features={features} />
`

export const ModuleChecklistExample = () => <TaskGridExampleRunner features={['checklist']} seedCode={MODULE_CHECKLIST_CODE} />
