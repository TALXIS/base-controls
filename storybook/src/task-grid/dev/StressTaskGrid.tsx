import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const STRESS_CODE = `const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    percentComplete: 'percentcomplete',
}

//the control sets a view's columns; the task grid also reads them from its data
const taskView = (id: string, name: string, data: ITaskViewData): IDatasetControlView<ITaskViewData> => ({ id, name, resolve: () => ({ columns: data.columns, data }) })

const VIEWS: IDatasetControlView<ITaskViewData>[] = [
    taskView('all', 'All tasks', { columns: getTaskColumns('subject', 'statuscode', 'priority', 'scheduledstart', 'scheduledend', 'percentcomplete', 'assignedto') }),
    taskView('planning', 'Planning', { columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'estimatedeffort', 'actualeffort'), sorting: [{ name: 'scheduledstart', sortDirection: 0 }] }),
    taskView('flat', 'Every task on its own', { columns: getTaskColumns('subject', 'statuscode', 'assignedto'), isFlatList: true, quickFindColumns: ['subject', 'description'] }),
]

const GridExample = () => {
    const modules = React.useMemo(() => ({
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        editing: createEditingModule({ autoSave: true }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }), [])
    const datasetControlModules = React.useMemo(() => [
        createTaskOperationsModule({ enableCreation: true, enableEditing: true, enableDeletion: true }),
        createTaskDraggingModule(),
    ], [])

    const onLoad = async ({ taskDatasetControl }: ITaskGridLoadParameters): Promise<ITaskGridLoadResult> => ({ provider: createMemoryTaskDataSource({ taskDatasetControl, strategy: new MemoryTaskStrategy({ records: createStressTasks(10000), metadata: TASK_METADATA, columns: TASK_COLUMNS }) }), fieldMapping })

    return <TaskDatasetControl modules={datasetControlModules} onLoadViews={async () => VIEWS} stateKey='devStressTasks' height='100%' onLoad={onLoad}>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.Ribbon />
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
                <TaskDatasetControl.Settings />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <TaskGrid stateKey='stressTaskGrid' modules={modules} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <TaskDatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
        </DatasetControl.Footer>
    </TaskDatasetControl>
}
`

/** The core task grid over 10,000 generated memory tasks. */
export const StressTaskGrid = () => <GridExampleRunner seedCode={STRESS_CODE} />
