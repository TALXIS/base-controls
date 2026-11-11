import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice, withTasks } from './shared'

const DRIVE_CODE = `import { createRowSelectionModule, DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { DefaultButton, Stack } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

const GridExample = () => {
    //every mount has a new task runtime, so keep the latest
    const runtimeRef = React.useRef<ITaskRuntime>()

    //called on every mount, before its modules load
    const onSetup = (control: IDatasetControl<ITaskViewData>) => {
        control.modules.observe('taskRuntime', (taskRuntime: ITaskRuntime) => {
            runtimeRef.current = taskRuntime
        })
    }

    const addTask = async () => {
        //resolves once the store has created it; null while enableCreation is off
        await runtimeRef.current!.tasks.create(undefined, { data: { subject: 'Review the budget', priority: 2 } })
    }

    const completeSelected = async () => {
        const taskRuntime = runtimeRef.current!
        const provider = taskRuntime.getProvider()
        const tasks = provider.getSelectedRecordIds().map(taskId => provider.getRecordsMap()[taskId])
        //behind the loading overlay, its failure shown in a dialog
        await taskRuntime.execute(async () => {
            for (const task of tasks) {
                task.setValue('percentcomplete', 100)
                await task.save()
            }
        }, { loading: { message: 'Completing the tasks...' }, error: { title: 'The tasks could not be completed.', rethrow: false } })
    }

    const toggleHierarchy = () => {
        const taskRuntime = runtimeRef.current!
        taskRuntime.setFlatList(!taskRuntime.isFlatList())
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal tokens={{ childrenGap: 8 }}>
            <DefaultButton text='Add a task' onClick={addTask} />
            <DefaultButton text='Complete the selected' onClick={completeSelected} />
            <DefaultButton text='Toggle the hierarchy' onClick={toggleHierarchy} />
        </Stack>
        <TaskDatasetControl enableCreation onSetup={onSetup} onLoad={loadTasks} height='440px'>
            <DatasetControl.Body>
                <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
            </DatasetControl.Body>
        </TaskDatasetControl>
    </Stack>
}
`

const COMMANDS_CODE = `import { createRowSelectionModule, DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//the task runtime has shown the failure already
const runQuietly = async (action: () => Promise<unknown>) => {
    try {
        await action()
    }
    catch { }
}

const onSetup = (control: IDatasetControl<ITaskViewData>) => {
    //the ribbon runs this on every load, such as when the selection changes
    control.parts.observe('ribbon', ribbon => ribbon.hooks.commands.add(commands => {
        const taskRuntime: ITaskRuntime = control.modules.get('taskRuntime')
        const provider = taskRuntime.getProvider()
        const [taskId] = provider.getSelectedRecordIds()
        if (!taskId) {
            return
        }
        const { structure } = provider.getRecordTree()
        const parentId = structure.getParent(taskId)?.getRecordId()
        const { previous, next } = structure.getNeighbours(taskId)
        commands.push(
            //a new sibling right before the selected task
            { id: 'insertAbove', label: 'Insert above', iconName: 'Add', onExecute: async () => { await taskRuntime.tasks.create(parentId, { position: { before: taskId } }) } },
            { id: 'moveUp', label: 'Move up', iconName: 'Up', disabled: !previous, onExecute: () => runQuietly(() => taskRuntime.tasks.move(taskId, previous!.getRecordId(), 'above')) },
            { id: 'moveDown', label: 'Move down', iconName: 'Down', disabled: !next, onExecute: () => runQuietly(() => taskRuntime.tasks.move(taskId, next!.getRecordId(), 'below')) },
        )
    }))
}

const GridExample = () => <TaskDatasetControl enableCreation onSetup={onSetup} onLoad={loadTasks} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'single' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const BACKEND_TASKS_CODE = `import { createRowSelectionModule, DatasetControl, ITaskCreateParameters, ITasksCreateResult, StackRank, TaskDatasetControl, TaskGrid, useTaskRuntime } from '@talxis/base-controls'
import type { IRawRecord } from '@talxis/client-libraries'
import { DefaultButton } from '@fluentui/react'
import { createLoadTasks, createTaskTable } from './tasks'

const tasks = createTaskTable()
const loadTasks = createLoadTasks(tasks)
const ID = TASK_METADATA.PrimaryIdAttribute

//stands in for a backend call that creates a task and its subtasks in one go
const createLaunchChecklist = async ({ parentRecord, stackRank }: ITaskCreateParameters): Promise<ITasksCreateResult> => {
    await new Promise(resolve => setTimeout(resolve, 1500))
    //the first task takes the parent and rank the provider worked out
    const checklist: IRawRecord = { [ID]: crypto.randomUUID(), subject: 'Launch checklist', parentid: parentRecord ? [parentRecord.getNamedReference()] : null, stackrank: stackRank, statecode: 0 }
    const checklistReference = [{ id: { guid: checklist[ID] }, etn: TASK_METADATA.LogicalName, name: checklist.subject }]
    let rank: string | undefined
    const steps: IRawRecord[] = ['Freeze the scope', 'Run the release checks', 'Announce the launch'].map(subject => {
        rank = StackRank.between(rank)
        return { [ID]: crypto.randomUUID(), subject, parentid: checklistReference, stackrank: rank, statecode: 0 }
    })
    tasks.insert([checklist, ...steps])
    //every task created, the subtasks included
    return { records: [checklist, ...steps] }
}

//a part of your own, drawn inside the control
const AddChecklistButton = () => {
    const taskRuntime = useTaskRuntime()

    const addChecklist = async () => {
        const [parentId] = taskRuntime.getProvider().getSelectedRecordIds()
        //createTasksWith shows no wait of its own, so it runs behind the loading overlay
        await taskRuntime.execute(() => taskRuntime.getProvider().createTasksWith(parentId, createLaunchChecklist, { position: 'last' }), {
            loading: { message: 'Adding the launch checklist...' },
            error: { title: 'The launch checklist could not be added.', rethrow: false },
        })
    }

    return <DefaultButton text='Add a launch checklist' onClick={addChecklist} />
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <AddChecklistButton />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'single' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const SETTINGS_CODE = `import { DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())
const IN_PROGRESS = { attributeName: 'statuscode', conditionOperator: Operators.Equal.Value, value: '2' }

const onSetup = (control: IDatasetControl<ITaskViewData>) => {
    //the part is there while TaskDatasetControl.Settings is drawn; the hook runs as its menu opens
    control.parts.observe('taskSettings', settings => settings.hooks.settings.add(items => {
        const provider = (control.modules.get('taskRuntime') as ITaskRuntime).getProvider()
        const conditions = provider.getFiltering()?.conditions ?? []
        const others = conditions.filter(condition => condition.attributeName !== IN_PROGRESS.attributeName)
        items.push({
            key: 'inProgress',
            label: 'In progress only',
            isChecked: others.length < conditions.length,
            onChange: async isChecked => {
                //kept with the other conditions, such as the one Hide inactive tasks sets
                provider.setFiltering({ filterOperator: Type.And.Value, filters: [], conditions: isChecked ? [...others, IN_PROGRESS] : others })
                await provider.refresh()
            },
        })
    }))
}

const GridExample = () => <TaskDatasetControl onSetup={onSetup} onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Settings />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const RIBBON_UI_CODE = `import { createRowSelectionModule, DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadTasks, createTaskTable } from './tasks'

const loadTasks = createLoadTasks(createTaskTable())

const onSetup = (control: IDatasetControl<ITaskViewData>) => {
    control.modules.observe('taskRuntime', (taskRuntime: ITaskRuntime) => taskRuntime.hooks.ribbonCommandUi.add(item => {
        const provider = taskRuntime.getProvider()
        //a project is a top-level task
        const isProjectSelected = provider.getSelectedRecordIds().some(taskId => !provider.getRecordTree().structure.getParent(taskId))
        if (item.key === 'delete' && isProjectSelected) {
            item.disabled = true
            item.title = 'Projects are closed, not deleted.'
        }
    }))
}

const GridExample = () => <TaskDatasetControl enableCreation enableEditing enableDeletion onSetup={onSetup} onLoad={loadTasks} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

export const DriveTheTaskGridExample = () => <GridExampleRunner seedCode={withTasks(DRIVE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const TaskCommandsExample = () => <GridExampleRunner seedCode={withOffice(COMMANDS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const BackendTasksExample = () => <GridExampleRunner seedCode={withTasks(BACKEND_TASKS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const OwnSettingsExample = () => <GridExampleRunner seedCode={withTasks(SETTINGS_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const RibbonCommandUiExample = () => <GridExampleRunner seedCode={withTasks(RIBBON_UI_CODE)} tabs={TASK_EXAMPLE_TABS} />
