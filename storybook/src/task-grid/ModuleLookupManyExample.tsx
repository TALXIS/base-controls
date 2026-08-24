import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const MODULE_LOOKUP_MANY_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = (data) => ({
    onGetLookupManyModule: () => createLookupManyModule({
        //called once per lookup-many cell: return the records its picker offers
        createDataProvider: ({ column }) => {
            const source = data.lookupSources[column.name]
            return source && MemoryLookupManyDataProviderFactory.create(source)
        },
    }),
})

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor} />
`

export const ModuleLookupManyExample = () => <TaskGridExampleRunner modules={['lookupMany']} seedCode={MODULE_LOOKUP_MANY_CODE} />
