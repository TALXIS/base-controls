import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { withTasks } from './shared'

interface IModuleExample {
    /** Declarations above the component, such as the module's view. */
    setup: string
    /** The control modules, as an array expression over `database`. */
    modules: string
    /** The view's columns, as an expression. */
    columns: string
    /** Parts added to the header's end, before the ribbon. */
    headerParts?: string
}

const createModuleCode = (example: IModuleExample) => `import { createLoadTasks, createTaskDatabase } from './tasks'
${example.setup}
const loadViews = async (): Promise<IDatasetControlView<ITaskViewData>[]> => [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: ${example.columns} }) },
]

const GridExample = () => {
    const database = React.useMemo(createTaskDatabase, [])
    const loadTasks = React.useMemo(() => createLoadTasks(database), [database])
    const gridModules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule(), createFilteringModule()], [])
    const controlModules = React.useMemo(() => ${example.modules}, [database])

    return <TaskDatasetControl modules={controlModules} enableCreation enableEditing enableDeletion onLoadViews={loadViews} onLoad={loadTasks} height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>${example.headerParts ?? ''}
                <TaskDatasetControl.Ribbon />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid modules={gridModules} />
        </DatasetControl.Body>
    </TaskDatasetControl>
}
`

const CUSTOM_COLUMNS_CODE = createModuleCode({
    setup: '',
    modules: `[
        createIndexedDbCustomColumnsModule({
            databaseName: 'taskGridDocs.customColumns',
            columns: [
                { displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] },
                { displayName: 'Budget', dataType: 'Currency', precision: 0 },
            ],
            enableCreation: true,
            enableDeletion: true,
        }),
    ]`,
    columns: `getTaskColumns('subject', 'statuscode', 'scheduledend')`,
    headerParts: `
                <DatasetControl.EditColumns />`,
})

const LOOKUP_MANY_CODE = createModuleCode({
    setup: `
//assignedto draws people, tags coloured pills, and teams plain ones
const COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'mem_person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'mem_tag', appearance: { type: 'colorful' } },
    teams: { displayName: 'Teams', entityName: 'mem_team' },
}
`,
    modules: `[createMemoryLookupManyModule({ sources: LOOKUP_MANY_SOURCES, columns: COLUMNS, values: LOOKUP_MANY_VALUES })]`,
    columns: `[...getTaskColumns('subject', 'statuscode'), ...LOOKUP_MANY_VIEW_COLUMNS]`,
})

const TEMPLATES_CODE = createModuleCode({
    setup: `
const ONBOARDING: IMemoryTemplate = {
    id: 'onboarding',
    name: 'Onboard a new colleague',
    data: { priority: 1 },
    children: [
        { data: { subject: 'Prepare the laptop', estimatedeffort: 2 } },
        { data: { subject: 'Create the accounts', estimatedeffort: 1 } },
        { data: { subject: 'First week', estimatedeffort: 40 }, children: [
            { data: { subject: 'Meet the team' } },
            { data: { subject: 'Pick a first task' } },
        ] },
    ],
}
`,
    modules: `[createMemoryTemplatesModule({ database, templates: [ONBOARDING, ...TEMPLATES] })]`,
    columns: `getTaskColumns('subject', 'priority', 'estimatedeffort')`,
})

const CHECKLIST_CODE = createModuleCode({
    setup: '',
    modules: `[createMemoryChecklistModule({ items: CHECKLIST_ITEMS })]`,
    columns: `[...getTaskColumns('subject', 'statuscode', 'percentcomplete'), CHECKLIST_COLUMN]`,
})

const DEPENDENCIES_CODE = createModuleCode({
    setup: '',
    modules: `[createMemoryDependenciesModule({ dependencies: DEPENDENCIES })]`,
    columns: `[...getTaskColumns('subject', 'scheduledstart', 'scheduledend'), ...DEPENDENCY_COLUMNS]`,
})

export const CustomColumnsExample = () => <GridExampleRunner seedCode={withTasks(CUSTOM_COLUMNS_CODE)} />
export const LookupManyExample = () => <GridExampleRunner seedCode={withTasks(LOOKUP_MANY_CODE)} />
export const TemplatesExample = () => <GridExampleRunner seedCode={withTasks(TEMPLATES_CODE)} />
export const ChecklistExample = () => <GridExampleRunner seedCode={withTasks(CHECKLIST_CODE)} />
export const DependenciesExample = () => <GridExampleRunner seedCode={withTasks(DEPENDENCIES_CODE)} />
