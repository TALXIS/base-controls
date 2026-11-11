import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withTasks } from './shared'

const VIEWS_CODE = `import { createFilteringModule, createSortingModule, DatasetControl, ITaskGridView, PATH_COLUMN_NAME, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

//a view lists the columns it shows; the mapped columns load anyway
const COLUMNS = [{ name: 'subject' }, { name: 'statuscode' }, { name: 'priority' }, { name: 'scheduledstart' }, { name: 'scheduledend' }]

//each view sets the task provider up as it opens
const VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'planning',
        name: 'Planning',
        resolve: provider => {
            //orders the subtasks under each parent
            provider.setSorting([{ name: 'scheduledstart', sortDirection: 0 }])
            return { columns: COLUMNS }
        },
    },
    {
        id: 'design',
        name: 'Design work',
        resolve: provider => {
            //searches the subject; the matches keep their ancestors, in italics
            provider.setSearchQuery('design')
            return { columns: COLUMNS }
        },
    },
    {
        id: 'flat',
        name: 'Every task on its own',
        //the matching tasks without the tree, each with the names of its ancestors
        resolve: () => ({ columns: [{ name: 'subject' }, { name: PATH_COLUMN_NAME }, { name: 'statuscode' }], data: { isFlatList: true } }),
    },
]

//the views come with the store
const loadTasks = createLoadTasks(createTaskTable(), VIEWS)

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createSortingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const USER_VIEWS_CODE = `import { createFilteringModule, createLocalStorageUserQueriesModule, createSortingModule, DatasetControl, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

//keeps the user's views in this browser; createTalxisUserQueriesModule keeps them in TALXIS
const modules = [createLocalStorageUserQueriesModule<ITaskViewData>({ storageKey: 'docs.taskViews' })]

const GridExample = () => <TaskDatasetControl modules={modules} onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher>
                {/* draws Manage views */}
                <DatasetControl.UserQueries />
            </DatasetControl.ViewSwitcher>
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createSortingModule(), createFilteringModule()]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const TaskViewsExample = () => <GridExampleRunner seedCode={withTasks(VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskUserViewsExample = () => <GridExampleRunner seedCode={withTasks(USER_VIEWS_CODE)} tabs={TASK_EXAMPLE_TABS} />
