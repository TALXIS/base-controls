import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `data` come from the sandbox. */
export const MODULE_USER_QUERIES_CODE = `/** The features this grid runs with. Anything not listed here is off. */
const features: ITaskGridFeatures = {
    userQueries: createUserQueryModule({
        //where the views are stored - swap this for your own backend
        onCreateStrategy: ({ services }) => new MemoryUserQueryStrategy({ userQueries: data.userQueries, services }),
        enableQueryManager: true,
        enableSaveAsNewQuery: true,
        enableSaveQueryChanges: true,
    }),
}

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    features={features} />
`

export const ModuleUserQueriesExample = () => <TaskGridExampleRunner features={['userQueries']} seedCode={MODULE_USER_QUERIES_CODE} />
