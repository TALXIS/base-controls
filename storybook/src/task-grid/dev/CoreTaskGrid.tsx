import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const CORE_CODE = `const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    percentComplete: 'percentcomplete',
}

const VIEWS: ITaskView[] = [
    { id: 'all', name: 'All tasks', data: { columns: getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete', 'assignedto') } },
    { id: 'planning', name: 'Planning', data: { columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), sorting: [{ name: 'scheduledstart', sortDirection: 0 }] } },
    { id: 'flat', name: 'Every task on its own', data: { columns: getTaskColumns('subject', 'statuscode', 'assignedto'), isFlatList: true, quickFindColumns: ['subject', 'description'] } },
]

//the user's own task views, one record each, with what the view shows kept as JSON
const userViews = new MemoryDataProvider({
    dataSource: [],
    metadata: { PrimaryIdAttribute: 'id', PrimaryNameAttribute: 'name', QuickFindColumns: ['name'] },
    columns: [
        { name: 'name', displayName: 'View name', dataType: DataTypes.SingleLineText, isPrimary: true, visualSizeFactor: 200 },
        { name: 'definition', displayName: 'Definition', dataType: DataTypes.Multiple, isHidden: true },
    ],
})

const readViewData = (record: IRecord): ITaskViewData => JSON.parse(record.getValue('definition'))

const writeViewData = ({ record, datasetControl }: IUserQueryWriteParameters<ITaskViewData>) => {
    record.setValue('definition', JSON.stringify(datasetControl.parts.get('taskDatasetControl').getCurrentViewData()))
}

const GridExample = () => {
    const modules = React.useMemo(() => ({
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        editing: createEditingModule({ autoSave: true }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
        custom: [createTaskDraggingModule()],
    }), [])
    const datasetControlModules = React.useMemo(() => ({
        userQueries: createUserQueriesModule<ITaskViewData>({ provider: userViews, onReadViewData: readViewData, onWriteViewData: writeViewData }),
        operations: createTaskOperationsModule({ enableCreation: true, enableEditing: true, enableDeletion: true }),
        project: createProjectModule({ onLoadProject: async () => ({ id: 'website', name: 'Website Redesign', startDate: dayjs('2025-10-01'), endDate: dayjs('2026-01-31') }) }),
    }), [])

    const onLoad = async ({ taskDatasetControl }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({ provider: createMemoryTaskDataSource({ taskDatasetControl, strategy: new MemoryTaskStrategy({ records: TASKS, metadata: TASK_METADATA, columns: TASK_COLUMNS }) }), fieldMapping })

    return <TaskDatasetControl modules={datasetControlModules} onLoadViews={async () => VIEWS} stateKey='devTasks' height='600px' onLoad={onLoad}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.Ribbon />
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <TaskDatasetControl.Notifications />
        <DatasetControl.Body>
            <TaskGrid stateKey='taskGrid' modules={modules} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

/** Phase 1 of the task grid, as the code a consumer writes, over memory tasks. */
export const CoreTaskGrid = () => <GridExampleRunner seedCode={CORE_CODE} />
