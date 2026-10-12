import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `data` come from the sandbox. */
export const MODULE_DEPENDENCIES_CODE = `/** The features this grid runs with. Anything not listed here is off. */
const features: ITaskGridFeatures = {
    dependencies: createDependenciesModule({
        //where the dependencies are read from
        onCreateStrategy: ({ services }) => new MemoryTaskDependencyStrategy({ dependencies: data.dependencies, services }),
    }),
}

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    features={features} />
`

export const ModuleDependenciesExample = () => <TaskGridExampleRunner features={['dependencies']} seedCode={MODULE_DEPENDENCIES_CODE} />
