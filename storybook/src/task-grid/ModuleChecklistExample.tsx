import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const MODULE_CHECKLIST_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = (data) => ({
    onGetChecklistModule: ({ services }) => createChecklistModule({
        //where the items are read from - the grid asks for the tasks it loaded, and the provider keeps
        //what comes back per task, so a cell can ask about its own without another read
        strategy: new MemoryChecklistStrategy({ items: data.checklist, services }),
        services,
    }),
})

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor} />
`

export const ModuleChecklistExample = () => <TaskGridExampleRunner modules={['checklist']} seedCode={MODULE_CHECKLIST_CODE} />
