import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `data` come from the sandbox. */
export const MODULE_TEMPLATES_CODE = `/** The features this grid runs with. Anything not listed here is off. */
const features: ITaskGridFeatures = {
    templates: createTemplateModule({
        //where the templates come from, and where a captured one is written
        onCreateProvider: ({ services }) => new MemoryTemplateDataProvider({ templates: data.templates, services }),
    }),
}

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    features={features} />
`

export const ModuleTemplatesExample = () => <TaskGridExampleRunner features={['templates']} seedCode={MODULE_TEMPLATES_CODE} />
