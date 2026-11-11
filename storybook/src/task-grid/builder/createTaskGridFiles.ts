import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { OFFICE_FILE } from '../examples/shared'

export type TaskGridStore = 'memory' | 'dataverse' | 'talxis' | 'api'

export type TaskGridFeature = 'editing' | 'creation' | 'deletion' | 'dragging' | 'userViews' | 'project' | 'customColumns' | 'lookupMany' | 'templates' | 'checklist' | 'dependencies'

export type TaskGanttFeature = 'timelineEditing' | 'taskSelection' | 'tooltip' | 'markers' | 'nonWorkingDays' | 'links'

/** What the reader picked, with every feature the store lacks or whose requirement is off already left out. */
export interface ITaskGridChoices {
    store: TaskGridStore
    features: TaskGridFeature[]
    isGanttEnabled: boolean
    ganttFeatures: TaskGanttFeature[]
}

/** The file each store other than memory writes its code to. */
export const STORE_FILE_NAMES: { [store in TaskGridStore]: string } = {
    memory: 'memory.ts',
    dataverse: 'dataverse.ts',
    talxis: 'talxis.ts',
    api: 'api.ts',
}

type Line = string | false | undefined

const lines = (...parts: Line[]) => parts.filter((part): part is string => typeof part === 'string').join('\n')

const indent = (code: string, depth: number) => code.split('\n').map(line => line ? `${'    '.repeat(depth)}${line}` : line).join('\n')

const importLine = (names: string[], from: string) => `import { ${[...new Set(names)].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })).join(', ')} } from '${from}'`

const factoryName = (call: string) => call.match(/^\w+/)![0]

//every task feature but the three enable props comes as a module of the control
const CONTROL_PROP_FEATURES: TaskGridFeature[] = ['editing', 'creation', 'deletion']

const hasControlModules = (choices: ITaskGridChoices) => choices.features.some(feature => !CONTROL_PROP_FEATURES.includes(feature))

const createEntryCode = (choices: ITaskGridChoices): string => {
    const has = (feature: TaskGridFeature) => choices.features.includes(feature)
    const hasGantt = (feature: TaskGanttFeature) => choices.isGanttEnabled && choices.ganttFeatures.includes(feature)
    const isSelectionNeeded = has('editing') || has('deletion') || has('templates') || hasGantt('taskSelection')
    const gridModules = [
        isSelectionNeeded && `createRowSelectionModule({ mode: 'multiple' })`,
        has('editing') && 'createTaskEditingModule()',
        has('userViews') && 'createSortingModule()',
        has('userViews') && 'createFilteringModule()',
    ].filter((call): call is string => !!call)
    const ganttModules = [
        'createLibraryModule()',
        hasGantt('timelineEditing') && 'createBarDraggingModule()',
        hasGantt('timelineEditing') && 'createTaskDrawingModule()',
        hasGantt('taskSelection') && 'createTaskSelectionModule()',
        hasGantt('tooltip') && 'createTaskTooltipModule()',
        hasGantt('markers') && 'createMarkersModule()',
        hasGantt('nonWorkingDays') && 'createNonWorkingDaysModule()',
        hasGantt('links') && 'createLinksModule()',
    ].filter((call): call is string => !!call)
    const isRibbonShown = has('creation') || has('editing') || has('deletion') || choices.isGanttEnabled
    const backendNames = hasControlModules(choices) ? ['controlModules', 'loadTasks'] : ['loadTasks']

    const headerStart = [
        has('userViews') && lines('<DatasetControl.ViewSwitcher>', '    <DatasetControl.UserQueries />', '</DatasetControl.ViewSwitcher>'),
        choices.isGanttEnabled && '<TaskGantt.ZoomSlider />',
    ].filter((part): part is string => !!part)
    const headerEnd = [
        isRibbonShown && '<TaskDatasetControl.Ribbon />',
        has('customColumns') && '<DatasetControl.EditColumns />',
        hasGantt('nonWorkingDays') && '<TaskDatasetControl.Settings />',
    ].filter((part): part is string => !!part)
    const header = headerStart.length + headerEnd.length > 0 && lines(
        '<DatasetControl.Header>',
        headerStart.length > 0 && indent(lines('<DatasetControl.Header.Start>', indent(headerStart.join('\n'), 1), '</DatasetControl.Header.Start>'), 1),
        headerEnd.length > 0 && indent(lines('<DatasetControl.Header.End>', indent(headerEnd.join('\n'), 1), '</DatasetControl.Header.End>'), 1),
        '</DatasetControl.Header>',
    )
    const grid = gridModules.length > 0 ? '<TaskGrid modules={gridModules} />' : '<TaskGrid />'
    const body = choices.isGanttEnabled ? lines('<TaskGantt.Split>', `    ${grid}`, '    <TaskGantt modules={ganttModules} />', '</TaskGantt.Split>') : grid
    const props = [
        hasControlModules(choices) && 'modules={controlModules}',
        has('creation') && 'enableCreation',
        has('editing') && 'enableEditing',
        has('deletion') && 'enableDeletion',
        'onLoad={loadTasks}',
        `height='${choices.isGanttEnabled ? 560 : 480}px'`,
    ].filter((prop): prop is string => !!prop)

    return lines(
        importLine(['DatasetControl', 'TaskDatasetControl', 'TaskGrid', ...gridModules.map(factoryName)], '@talxis/base-controls'),
        choices.isGanttEnabled && importLine(['TaskGantt', ...ganttModules.map(factoryName)], '@talxis/base-controls/gantt'),
        choices.store === 'memory'
            ? '//the tasks in memory, with the modules that keep data beside them'
            : `//runs in memory on this page; ${STORE_FILE_NAMES[choices.store]} exports the same for your app`,
        `import { ${backendNames.join(', ')} } from './memory'`,
        '',
        gridModules.length > 0 && `const gridModules = [${gridModules.join(', ')}]`,
        choices.isGanttEnabled && '//the library draws the chart; each other module adds one feature',
        choices.isGanttEnabled && `const ganttModules = [${ganttModules.join(', ')}]`,
        (gridModules.length > 0 || choices.isGanttEnabled) && '',
        `const GridExample = () => <TaskDatasetControl ${props.join(' ')}>`,
        header && indent(header, 1),
        '    <DatasetControl.Body>',
        indent(body, 2),
        '    </DatasetControl.Body>',
        '</TaskDatasetControl>',
        '',
    )
}

interface IStoreSchema {
    /** The columns the view shows, the modules' own left out. */
    viewColumns: string[]
    fieldMapping: string
}

const SCHEMAS: { [store in TaskGridStore]: IStoreSchema } = {
    memory: {
        viewColumns: ['subject', 'owner', 'start', 'due', 'done'],
        fieldMapping: `{ parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }`,
    },
    api: {
        viewColumns: ['subject', 'owner', 'start', 'due', 'done'],
        fieldMapping: `{ parentId: 'parentid', subject: 'subject', stackRank: 'stackrank', stateCode: 'statecode', startDate: 'start', endDate: 'due', percentComplete: 'done' }`,
    },
    dataverse: {
        viewColumns: ['new_name', 'new_owner', 'new_start', 'new_due', 'new_percentcomplete'],
        fieldMapping: `{ parentId: 'new_parenttaskid', subject: 'new_name', stackRank: 'new_stackrank', stateCode: 'statecode', startDate: 'new_start', endDate: 'new_due', percentComplete: 'new_percentcomplete' }`,
    },
    talxis: {
        viewColumns: ['talxis_name', 'talxis_estimatedstartdate', 'talxis_estimatedenddate', 'talxis_percentcomplete'],
        fieldMapping: `{ parentId: 'talxis_parentprojecttaskid', subject: 'talxis_name', stackRank: 'talxis_stackrankstring', stateCode: 'statecode', startDate: 'talxis_estimatedstartdate', endDate: 'talxis_estimatedenddate', percentComplete: 'talxis_percentcomplete' }`,
    },
}

//the view, with the columns the modules add listed by name
const createViewCode = (choices: ITaskGridChoices): { code: string, names: string[] } => {
    const has = (feature: TaskGridFeature) => choices.features.includes(feature)
    const columns = [
        ...SCHEMAS[choices.store].viewColumns.map(name => `{ name: '${name}' }`),
        has('lookupMany') && `{ name: 'assignedto', dataType: 'Lookup.Simple' }`,
        has('customColumns') && choices.store === 'memory' && `{ name: RISK, dataType: 'OptionSet' }`,
        has('checklist') && '{ name: TASK_CHECKLIST_COLUMN_NAME }',
        has('dependencies') && '{ name: PREDECESSORS_COLUMN_NAME }',
        has('dependencies') && '{ name: SUCCESSORS_COLUMN_NAME }',
    ].filter((column): column is string => !!column)
    return {
        code: lines(
            has('userViews') ? `//the views you give; the user saves more of their own` : `//the columns the view shows, the modules' own among them by name`,
            `const VIEWS: ITaskGridView[] = [{ id: 'plan', name: 'Plan', resolve: () => ({ columns: [${columns.join(', ')}] }) }]`,
        ),
        names: ['ITaskGridView', ...has('checklist') ? ['TASK_CHECKLIST_COLUMN_NAME'] : [], ...has('dependencies') ? ['PREDECESSORS_COLUMN_NAME', 'SUCCESSORS_COLUMN_NAME'] : []],
    }
}

const LOAD_TASKS_NAMES = ['IFieldMapping', 'ITaskGridLoadResult', 'ITaskRuntime']

const createMemoryCode = (choices: ITaskGridChoices): string => {
    const has = (feature: TaskGridFeature) => choices.features.includes(feature)
    const view = createViewCode(choices)
    const modules = [
        has('project') && `createMemoryProjectModule({ projects, projectId: 'office' })`,
        has('dragging') && 'createTaskDraggingModule()',
        has('userViews') && `//the user's views, kept in this browser`,
        has('userViews') && `createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'taskGridBuilder.views' })`,
        has('customColumns') && 'createMemoryCustomColumnsModule({ columns: customColumns, values: customValues, enableCreation: true, enableDeletion: true })',
        has('lookupMany') && lines(
            'createMemoryLookupManyModule({',
            `    columns: { assignedto: { displayName: 'Assigned to', entityName: 'person', appearance: { type: 'people' } } },`,
            `    sources: { person: { records: people, metadata: { PrimaryIdAttribute: 'personid', PrimaryNameAttribute: 'name', LogicalName: 'person', QuickFindColumns: ['name'] }, columns: [{ name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true }] } },`,
            '    values: assignments,',
            '})',
        ),
        has('templates') && 'createMemoryTemplatesModule({ tasks, templates })',
        has('checklist') && 'createMemoryTaskChecklistModule({ items: checklistItems })',
        has('dependencies') && 'createMemoryDependenciesModule({ dependencies })',
    ].filter((call): call is string => !!call)
    const moduleNames = modules.filter(call => call.startsWith('create')).map(factoryName)
    const tableNames = [has('project') && 'IMemoryProject', has('dependencies') && 'ITaskDependency', has('checklist') && 'IMemoryTaskChecklistItem', has('lookupMany') && 'IMemoryLookupManyValues', has('customColumns') && 'ICustomColumnRow', has('customColumns') && 'ICustomColumnValuesRow', has('templates') && 'IMemoryTemplate', has('userViews') && 'ITaskViewData'].filter((name): name is string => !!name)

    return lines(
        importLine([...LOAD_TASKS_NAMES, 'MemoryTable', 'MemoryTaskStore', ...view.names, ...moduleNames, ...tableNames], '@talxis/base-controls'),
        (has('customColumns') || has('lookupMany')) && importLine([...has('customColumns') ? ['DatasetConstants'] : [], ...has('lookupMany') ? ['IRawRecord'] : []], '@talxis/client-libraries'),
        `import { createOfficeTable, OFFICE_COLUMNS, OFFICE_METADATA } from './office'`,
        '',
        '//one table for the page, so what the user changes outlives every mount',
        'const tasks = createOfficeTable()',
        has('project') && lines(
            '',
            `const projects = new MemoryTable<IMemoryProject>({ idKey: 'id', rows: [{ id: 'office', name: 'New office', startDate: '2026-01-05', endDate: '2026-04-10' }] })`,
        ),
        has('customColumns') && lines(
            '',
            '//a custom column\'s full name ends with this suffix',
            'const RISK = `risk${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`',
            `const customColumns = new MemoryTable<ICustomColumnRow>({ idKey: 'name', rows: [{ name: 'risk', displayName: 'Risk', dataType: 'OptionSet', options: ['Low', 'Medium', 'High'] }] })`,
            '//a choice holds the number of its option, counted from 1',
            `const customValues = new MemoryTable<ICustomColumnValuesRow>({ idKey: 'taskId', rows: [{ taskId: 'network', values: { [RISK]: 3 } }, { taskId: 'movers', values: { [RISK]: 2 } }] })`,
        ),
        has('lookupMany') && lines(
            '',
            '//the people to pick from, and who is on which task',
            `const people = new MemoryTable<IRawRecord>({ idKey: 'personid', rows: [{ personid: 'jana', name: 'Jana' }, { personid: 'tomas', name: 'Tomáš' }, { personid: 'petra', name: 'Petra' }, { personid: 'martin', name: 'Martin' }, { personid: 'lucie', name: 'Lucie' }] })`,
            `const assignments = new MemoryTable<IMemoryLookupManyValues>({ idKey: 'taskId', rows: [`,
            `    { taskId: 'desks', values: { assignedto: [{ id: { guid: 'petra' }, etn: 'person', name: 'Petra' }, { id: { guid: 'tomas' }, etn: 'person', name: 'Tomáš' }] } },`,
            `    { taskId: 'network', values: { assignedto: [{ id: { guid: 'martin' }, etn: 'person', name: 'Martin' }] } },`,
            '] })',
        ),
        has('templates') && lines(
            '',
            '//a task with its subtasks, created again in one go',
            `const templates = new MemoryTable<IMemoryTemplate>({ idKey: 'id', rows: [{ id: 'room', name: 'Set up a meeting room', children: [{ data: { subject: 'Order the furniture' } }, { data: { subject: 'Hang the screen' } }, { data: { subject: 'Test a video call' } }] }] })`,
        ),
        has('checklist') && lines(
            '',
            `const checklistItems = new MemoryTable<IMemoryTaskChecklistItem>({ idKey: 'id', rows: [`,
            `    { id: 'desks-1', taskId: 'desks', name: 'Measure the rooms', isCompleted: true },`,
            `    { id: 'desks-2', taskId: 'desks', name: 'Pick the chairs', isCompleted: true },`,
            `    { id: 'desks-3', taskId: 'desks', name: 'Place the order', isCompleted: false },`,
            `    { id: 'invites-1', taskId: 'invites', name: 'Write the guest list', isCompleted: false },`,
            '] })',
        ),
        has('dependencies') && lines(
            '',
            '//each successor waits for its predecessor to finish',
            `const dependencies = new MemoryTable<ITaskDependency>({ idKey: 'id', rows: [`,
            `    { id: 'lease-fitout', predecessorTaskId: 'lease', successorTaskId: 'fitout', type: 'finishToStart' },`,
            `    { id: 'fitout-movers', predecessorTaskId: 'fitout', successorTaskId: 'movers', type: 'finishToStart' },`,
            `    { id: 'movers-movein', predecessorTaskId: 'movers', successorTaskId: 'movein', type: 'finishToStart' },`,
            '] })',
        ),
        '',
        '//which of your columns make the tree, and which hold the dates',
        `const fieldMapping: IFieldMapping = ${SCHEMAS.memory.fieldMapping}`,
        '',
        view.code,
        '',
        'export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({',
        '    store: new MemoryTaskStore({ taskRuntime, tasks, metadata: OFFICE_METADATA, columns: OFFICE_COLUMNS }),',
        '    fieldMapping,',
        '    views: VIEWS,',
        '})',
        modules.length > 0 && lines('', 'export const controlModules = [', indent(modules.map(call => call.startsWith('//') ? call : `${call},`).join('\n'), 1), ']'),
        '',
    )
}

const createDataverseCode = (choices: ITaskGridChoices): string => {
    const has = (feature: TaskGridFeature) => choices.features.includes(feature)
    const isTalxis = choices.store === 'talxis'
    const view = createViewCode(choices)
    const schema = isTalxis
        ? { task: 'talxis_projecttask', attributes: ['talxis_name', 'talxis_parentprojecttaskid', 'talxis_stackrankstring', 'statecode', 'talxis_estimatedstartdate', 'talxis_estimatedenddate', 'talxis_percentcomplete'], projectLookup: 'talxis_projectid' }
        : { task: 'new_projecttask', attributes: ['new_name', 'new_parenttaskid', 'new_stackrank', 'statecode', 'new_owner', 'new_start', 'new_due', 'new_percentcomplete'], projectLookup: 'new_projectid' }
    const fetchXml = lines(
        'const FETCH_XML = `<fetch>',
        `    <entity name="${schema.task}">`,
        ...schema.attributes.map(attribute => `        <attribute name="${attribute}" />`),
        has('project') && lines(
            '        <filter>',
            `            <condition attribute="${schema.projectLookup}" operator="eq" value="{{ project.id }}" />`,
            '        </filter>',
        ),
        '    </entity>',
        '</fetch>`',
    )
    const lookupMany = lines(
        'createDataverseLookupManyModule({',
        '    columns: {',
        '        assignedto: {',
        `            displayName: 'Assigned to',`,
        `            entityName: 'systemuser',`,
        '            //an N:N relationship of your own between the tasks and the users',
        `            navigationPropertyName: 'new_${isTalxis ? 'talxis_projecttask' : 'projecttask'}_systemuser',`,
        `            appearance: { type: 'people' },`,
        `            fetchXml: '<fetch><entity name="systemuser"><attribute name="fullname" /></entity></fetch>',`,
        '        },',
        '    },',
        '})',
    )
    const modules = [
        has('project') && '//new tasks get the lookup to the project filled in',
        has('project') && (isTalxis ? `createDataverseProjectModule({ entityName: 'talxis_project', id: PROJECT_ID })` : `createDataverseProjectModule({ entityName: 'new_project', id: PROJECT_ID, startDateColumn: 'new_start', endDateColumn: 'new_end' })`),
        has('dragging') && 'createTaskDraggingModule()',
        has('userViews') && (isTalxis
            ? `createTalxisUserQueriesModule<ITaskViewData>({ entityName: '${schema.task}' })`
            : `createDataverseUserQueriesModule<ITaskViewData>({ table: { name: 'new_userquery', fieldMapping: { name: 'new_name', layout: 'new_layoutjson', returnedTypeCode: 'new_returnedtypecode' } }, entityName: '${schema.task}' })`),
        has('customColumns') && `createTalxisCustomColumnsModule({ entityName: '${schema.task}', ${has('project') ? 'recordId: PROJECT_ID, ' : ''}enableCreation: true, enableEditing: true, enableDeletion: true })`,
        has('lookupMany') && lookupMany,
        has('checklist') && '//talxis_checklistjson on each task',
        has('checklist') && 'createTalxisTaskChecklistModule()',
        has('dependencies') && (isTalxis ? '//talxis_taskdependency' : '//a table of your own with two lookups to the tasks and an option set of the type'),
        has('dependencies') && (isTalxis ? 'createTalxisDependenciesModule()' : lines(
            'createDataverseDependenciesModule({',
            `    entityName: 'new_taskdependency',`,
            `    predecessorAttribute: 'new_predecessorid',`,
            `    successorAttribute: 'new_successorid',`,
            `    typeAttribute: 'new_type',`,
            `    dependencyTypeCodes: { 100000000: 'finishToStart', 100000001: 'startToStart', 100000002: 'finishToFinish', 100000003: 'startToFinish' },`,
            '})',
        )),
    ].filter((call): call is string => !!call)
    const moduleNames = modules.filter(call => call.startsWith('create')).map(factoryName)

    return lines(
        importLine([...LOAD_TASKS_NAMES, 'DataverseTaskStore', ...view.names, ...moduleNames, ...has('userViews') ? ['ITaskViewData'] : []], '@talxis/base-controls'),
        '',
        isTalxis ? '//not run on this page: the same task grid over the TALXIS project tables' : '//not run on this page: the same task grid over tables of your own in Dataverse',
        has('project') && `const PROJECT_ID = '00000000-0000-0000-0000-000000000001'`,
        '',
        has('project') ? '//a Liquid template; project comes from the project module' : '//a Liquid template over hostRecord, and over project with the project module',
        fetchXml,
        '',
        `const fieldMapping: IFieldMapping = ${SCHEMAS[choices.store].fieldMapping}`,
        '',
        view.code,
        '',
        'export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({',
        '    store: new DataverseTaskStore({ taskRuntime, fetchXml: FETCH_XML }),',
        '    fieldMapping,',
        '    views: VIEWS,',
        '})',
        modules.length > 0 && lines('', 'export const controlModules = [', indent(modules.map(call => call.startsWith('//') ? call : `${call},`).join('\n'), 1), ']'),
        '',
    )
}

const createApiCode = (choices: ITaskGridChoices): string => {
    const has = (feature: TaskGridFeature) => choices.features.includes(feature)
    const view = createViewCode(choices)
    const modules = [
        has('project') && lines(
            'createProjectModule({',
            '    createStore: () => ({',
            '        //add startDate and endDate as Dayjs to mark them on the Gantt',
            '        loadProject: async () => request<IProjectData>(\'GET\', `/projects/${PROJECT_ID}`),',
            '    }),',
            '})',
        ),
        has('dragging') && 'createTaskDraggingModule()',
        has('userViews') && `//or createUserQueriesModule({ createStore }) to keep them in your API`,
        has('userViews') && `createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'tasks.views' })`,
        has('customColumns') && lines(
            'createCustomColumnsModule({',
            '    createStore: () => ({',
            '        //each name ends with DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX',
            `        loadColumns: async () => request<IColumn[]>('GET', '/custom-columns'),`,
            `        loadValues: async taskIds => new Map(Object.entries(await request<{ [taskId: string]: IRawRecord }>('POST', '/custom-values/query', { taskIds }))),`,
            '        saveValue: async (record, column, value) => {',
            '            await request(\'PUT\', `/custom-values/${record.getRecordId()}/${column.name}`, { value })',
            '            return { recordId: record.getRecordId(), success: true, fields: [column.name] }',
            '        },',
            '        //called only with enableCreation and enableEditing',
            `        createColumn: async () => { throw new Error('Not implemented.') },`,
            `        updateColumn: async () => { throw new Error('Not implemented.') },`,
            '        deleteColumn: async columnName => {',
            '            await request(\'DELETE\', `/custom-columns/${columnName}`)',
            '            return columnName',
            '        },',
            '    }),',
            '    enableDeletion: true,',
            '})',
        ),
        has('lookupMany') && lines(
            'createLookupManyModule({',
            `    columns: { assignedto: { displayName: 'Assigned to', entityName: 'person', appearance: { type: 'people' } } },`,
            '    createStore: () => {',
            '        let people: IRawRecord[] = []',
            '        return {',
            '            loadValues: async taskIds => {',
            `                people = await request<IRawRecord[]>('GET', '/people')`,
            `                return new Map(Object.entries(await request<{ [taskId: string]: { [columnName: string]: ComponentFramework.EntityReference[] } }>('POST', '/assignments/query', { taskIds })))`,
            '            },',
            '            saveValue: async (taskId, columnName, value) => request(\'PUT\', `/assignments/${taskId}/${columnName}`, value),',
            '            //the people the editor and the filter search, read with the values',
            `            createOptionsProvider: () => new MemoryDataProvider({ dataSource: people, metadata: { PrimaryIdAttribute: 'personid', PrimaryNameAttribute: 'name', LogicalName: 'person', QuickFindColumns: ['name'] }, columns: [{ name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true }] }),`,
            '        }',
            '    },',
            '})',
        ),
        has('templates') && lines(
            'createTemplatesModule({',
            '    createStore: () => {',
            '        let templates: IRawRecord[] = []',
            '        //read as the control mounts, long before the user opens the picker',
            '        const loadTemplates = async () => {',
            `            templates = await request<IRawRecord[]>('GET', '/templates')`,
            '        }',
            '        loadTemplates()',
            '        return {',
            `            createTemplatesProvider: () => new MemoryDataProvider({ dataSource: templates, metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name', LogicalName: 'template', QuickFindColumns: ['name'] }, columns: [{ name: 'name', displayName: 'Name', dataType: 'SingleLine.Text', isPrimary: true }] }),`,
            '            //every task created, the template\'s own first and the rest under it',
            '            createTasks: async ({ templateId, parentRecord, stackRank }) => {',
            '                const created = await request<IRawRecord[]>(\'POST\', `/templates/${templateId}/tasks`, { parentId: parentRecord?.getRecordId() ?? null, stackRank })',
            '                return { records: created.map(toRow) }',
            '            },',
            '        }',
            '    },',
            '})',
        ),
        has('checklist') && lines(
            'createTaskChecklistModule({',
            '    createStore: () => ({',
            `        loadItems: async taskIds => new Map(Object.entries(await request<{ [taskId: string]: ITaskChecklistItem[] }>('POST', '/checklists/query', { taskIds }))),`,
            '    }),',
            '})',
        ),
        has('dependencies') && lines(
            'createDependenciesModule({',
            '    createStore: () => ({',
            `        loadDependencies: async taskIds => request<ITaskDependency[]>('POST', '/dependencies/query', { taskIds }),`,
            `        createDependency: async dependency => request<ITaskDependency>('POST', '/dependencies', dependency),`,
            '        updateDependency: async dependency => request(\'PUT\', `/dependencies/${dependency.id}`, dependency),',
            '        deleteDependency: async dependencyId => request(\'DELETE\', `/dependencies/${dependencyId}`),',
            '    }),',
            '})',
        ),
    ].filter((call): call is string => !!call)
    const moduleNames = modules.filter(call => call.startsWith('create')).map(factoryName)
    const typeNames = [has('project') && 'IProjectData', has('checklist') && 'ITaskChecklistItem', has('dependencies') && 'ITaskDependency', has('userViews') && 'ITaskViewData'].filter((name): name is string => !!name)
    const clientNames = ['IColumn', 'IRawRecord', 'IRecord', 'IRecordSaveOperationResult', ...has('lookupMany') || has('templates') ? ['MemoryDataProvider'] : []]

    return lines(
        importLine([...LOAD_TASKS_NAMES, 'IDeleteTasksResult', 'IOpenTasksResult', 'ITaskCreateParameters', 'ITaskCreateResult', 'ITaskDeleteParameters', 'ITaskLoadResult', 'ITaskStore', ...view.names, ...moduleNames, ...typeNames], '@talxis/base-controls'),
        importLine(clientNames, '@talxis/client-libraries'),
        '',
        '//not run on this page: the same task grid over an API of your own',
        `const API_URL = 'https://example.com/api'`,
        has('project') && `const PROJECT_ID = 'office'`,
        '',
        'const request = async <T = void,>(method: string, path: string, body?: unknown): Promise<T> => {',
        '    const response = await fetch(`${API_URL}${path}`, { method, headers: { \'Content-Type\': \'application/json\' }, body: JSON.stringify(body) })',
        '    if (!response.ok) {',
        '        throw new Error(`${method} ${path} failed with ${response.status}.`)',
        '    }',
        '    const text = await response.text()',
        '    return text ? JSON.parse(text) : undefined',
        '}',
        '',
        `const COLUMNS: IColumn[] = [`,
        `    { name: 'subject', displayName: 'Task', dataType: 'SingleLine.Text', isPrimary: true },`,
        `    { name: 'owner', displayName: 'Owner', dataType: 'SingleLine.Text' },`,
        `    { name: 'start', displayName: 'Start', dataType: 'DateAndTime.DateOnly' },`,
        `    { name: 'due', displayName: 'Due', dataType: 'DateAndTime.DateOnly' },`,
        `    { name: 'done', displayName: '% done', dataType: 'Whole.None' },`,
        `    { name: 'taskid', displayName: 'ID', dataType: 'SingleLine.Text', isHidden: true },`,
        `    { name: 'parentid', displayName: 'Parent', dataType: 'Lookup.Simple', isHidden: true },`,
        `    { name: 'stackrank', displayName: 'Rank', dataType: 'SingleLine.Text', isHidden: true },`,
        `    { name: 'statecode', displayName: 'State', dataType: 'Whole.None', isHidden: true },`,
        ']',
        '',
        '//your API keeps the parent\'s id, and the task grid reads the parent as a lookup',
        `const toRow = (task: IRawRecord): IRawRecord => ({ ...task, parentid: task.parentid ? [{ id: { guid: task.parentid }, etn: 'task', name: '' }] : null })`,
        '',
        'class ApiTaskStore implements ITaskStore {',
        '    public async load(): Promise<ITaskLoadResult> {',
        `        const tasks = await request<IRawRecord[]>('GET', '/tasks')`,
        `        return { rawData: tasks.map(toRow), metadata: { PrimaryIdAttribute: 'taskid', LogicalName: 'task' }, columns: COLUMNS }`,
        '    }',
        '',
        '    public async getAvailableColumns() {',
        '        return COLUMNS',
        '    }',
        '',
        '    public async getAvailableRelatedColumns() {',
        '        return []',
        '    }',
        '',
        '    //the grid already shows the task under taskId, with its parent and rank worked out',
        '    public async createTask(parameters: ITaskCreateParameters): Promise<ITaskCreateResult> {',
        `        const task = await request<IRawRecord>('POST', '/tasks', { ...parameters.data, taskid: parameters.taskId, parentid: parameters.parentRecord?.getRecordId() ?? null, stackrank: parameters.stackRank, statecode: 0 })`,
        '        return { record: toRow(task) }',
        '    }',
        '',
        '    //an edit, or a move with its new parent and rank',
        '    public async saveTask(task: IRecord): Promise<IRecordSaveOperationResult> {',
        '        const fields = task.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name)',
        `        const changes = Object.fromEntries(fields.map(name => [name, name === 'parentid' ? task.getValue(name)?.[0]?.id.guid ?? null : task.getValue(name)]))`,
        '        await request(\'PATCH\', `/tasks/${task.getRecordId()}`, changes)',
        '        return { recordId: task.getRecordId(), success: true, fields }',
        '    }',
        '',
        '    //called level by level, the deepest tasks first',
        '    public async deleteTasks(parameters: ITaskDeleteParameters): Promise<IDeleteTasksResult> {',
        `        await request('POST', '/tasks/delete', { taskIds: parameters.taskIds })`,
        '        return { success: true, deletedTaskIds: parameters.taskIds }',
        '    }',
        '',
        '    //Edit opens the tasks in a form of your app; null when nothing changed',
        '    public async openTasks(): Promise<IOpenTasksResult | null> {',
        `        throw new Error('Not implemented.')`,
        '    }',
        '',
        '    public async openRelatedRecord() {',
        `        throw new Error('Not implemented.')`,
        '    }',
        '}',
        '',
        `const fieldMapping: IFieldMapping = ${SCHEMAS.api.fieldMapping}`,
        '',
        view.code,
        '',
        'export const loadTasks = (taskRuntime: ITaskRuntime): ITaskGridLoadResult => ({',
        '    store: new ApiTaskStore(),',
        '    fieldMapping,',
        '    views: VIEWS,',
        '})',
        modules.length > 0 && lines('', 'export const controlModules = [', indent(modules.map(call => call.startsWith('//') ? call : `${call},`).join('\n'), 1), ']'),
        '',
    )
}

/** The files of the builder's example: the entry, the memory store it runs, the sample plan, and the chosen store's own. */
export const createTaskGridFiles = (choices: ITaskGridChoices): IGridExampleFile[] => {
    const memoryChoices = { ...choices, store: 'memory' as const }
    const files: IGridExampleFile[] = [
        { name: 'GridExample.tsx', code: createEntryCode(choices) },
        { name: 'memory.ts', code: createMemoryCode(memoryChoices) },
        OFFICE_FILE,
    ]
    switch (choices.store) {
        case 'dataverse':
        case 'talxis':
            return [...files, { name: STORE_FILE_NAMES[choices.store], code: createDataverseCode(choices) }]
        case 'api':
            return [...files, { name: STORE_FILE_NAMES.api, code: createApiCode(choices) }]
        default:
            return files
    }
}
