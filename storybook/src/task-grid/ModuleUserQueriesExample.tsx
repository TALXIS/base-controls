import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const MODULE_USER_QUERIES_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = (data) => ({
    onGetUserQueriesModule: ({ services }) => createUserQueryModule({
        //where the views are stored - swap this for your own backend
        strategy: new MemoryUserQueryStrategy({ userQueries: data.userQueries, services }),
        services,
        enableQueryManager: true,
        enableSaveAsNewQuery: true,
        enableSaveQueryChanges: true,
    }),
})

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor} />
`

export const ModuleUserQueriesExample = () => <TaskGridExampleRunner modules={['userQueries']} seedCode={MODULE_USER_QUERIES_CODE} />
