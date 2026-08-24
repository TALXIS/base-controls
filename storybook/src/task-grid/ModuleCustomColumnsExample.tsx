import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const MODULE_CUSTOM_COLUMNS_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = () => ({
    onGetCustomColumnsModule: () => createCustomColumnsModule({
        //nothing in-memory ships, so this is a small strategy written for the docs
        strategy: new MemoryCustomColumnsStrategy(),
        enableCustomColumnCreation: true,
        enableCustomColumnEditing: true,
        enableCustomColumnDeletion: true,
    }),
})

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor} />
`

export const ModuleCustomColumnsExample = () => <TaskGridExampleRunner seedCode={MODULE_CUSTOM_COLUMNS_CODE} />
