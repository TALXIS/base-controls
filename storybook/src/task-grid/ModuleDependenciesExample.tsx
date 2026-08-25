import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const MODULE_DEPENDENCIES_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = (data) => ({
    onGetDependenciesModule: (services) => createDependenciesModule({
        //where the dependencies are read from - the grid asks for the tasks it loaded, and the
        //provider indexes what comes back so a cell can ask about one task
        strategy: new MemoryTaskDependencyStrategy({ dependencies: data.dependencies }),
        services,
    }),
})

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor} />
`

export const ModuleDependenciesExample = () => <TaskGridExampleRunner modules={['dependencies']} seedCode={MODULE_DEPENDENCIES_CODE} />
