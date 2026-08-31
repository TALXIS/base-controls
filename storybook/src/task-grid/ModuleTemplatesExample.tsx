import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const MODULE_TEMPLATES_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = (data) => ({
    onGetTemplatesModule: ({ services }) => createTemplateModule({
        //where the templates come from, where a captured one is written, and the services it reads the
        //task columns, metadata and hierarchy through
        provider: new MemoryTemplateDataProvider({ templates: data.templates, services }),
    }),
})

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor} />
`

export const ModuleTemplatesExample = () => <TaskGridExampleRunner modules={['templates']} seedCode={MODULE_TEMPLATES_CODE} />
