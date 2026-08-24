import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const MODULE_TEMPLATES_CODE = `/** The modules this grid runs with. Anything not listed here is off. */
const getModules: GetModules = (data) => ({
    onGetTemplatesModule: (context) => createTemplateModule({
        //where the templates come from, where a captured one is written, and the task side a template
        //is expanded into
        provider: new MemoryTemplateDataProvider({ templates: data.templates, onGetTaskDataProvider: context.onGetTaskDataProvider }),
    }),
})

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor} />
`

export const ModuleTemplatesExample = () => <TaskGridExampleRunner seedCode={MODULE_TEMPLATES_CODE} />
