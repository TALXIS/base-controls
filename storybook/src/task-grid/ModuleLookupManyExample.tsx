import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `data` come from the sandbox. */
export const MODULE_LOOKUP_MANY_CODE = `/** The features this grid runs with. Anything not listed here is off. */
const features: ITaskGridFeatures = {
    lookupMany: createLookupManyModule({
        //called once per lookup-many cell: return the records its picker offers
        createDataProvider: ({ column, services }) => {
            const source = data.lookupSources[column.name]
            return source && MemoryLookupManyDataProviderFactory.create({ source, services })
        },
    }),
}

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    features={features} />
`

export const ModuleLookupManyExample = () => <TaskGridExampleRunner features={['lookupMany']} seedCode={MODULE_LOOKUP_MANY_CODE} />
