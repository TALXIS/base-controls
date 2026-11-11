import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { TASK_EXAMPLE_TABS, withOffice } from '../../examples/shared'

const FROM_YOUR_CODE_CODE = `import { createRowSelectionModule, DatasetControl, TaskDatasetControl, TaskGrid, useTaskRuntime } from '@talxis/base-controls'
import { DefaultButton, Stack, Text } from '@fluentui/react'
import { createLoadOffice, STATUS } from './office'

const loadTasks = createLoadOffice()

//new: drawn inside the control, so useTaskRuntime() returns the task runtime of this mount
const PlanToolbar = () => {
    const taskRuntime = useTaskRuntime()
    const [activity, setActivity] = React.useState('No changes yet')

    //new: the task events report the tasks created and deleted, whoever did it
    React.useEffect(() => {
        const { taskEvents } = taskRuntime.getProvider()
        const removers = [
            taskEvents.addEventListener('onTasksCreated', tasks => setActivity('Created ' + tasks.map(task => task.getValue('subject')).join(', '))),
            taskEvents.addEventListener('onTasksDeleted', taskIds => setActivity('Deleted ' + taskIds.length + (taskIds.length === 1 ? ' task' : ' tasks'))),
        ]
        return () => removers.forEach(remove => remove())
    }, [taskRuntime])

    const addCheck = async () => {
        const [taskId] = taskRuntime.getProvider().getSelectedRecordIds()
        //new: last under the selected task; resolves the task, or null when it was not created
        await taskRuntime.tasks.create(taskId, { position: 'last', data: { subject: 'Check the work', status: STATUS.notStarted } })
    }

    const markDone = async () => {
        const provider = taskRuntime.getProvider()
        const tasks = provider.getSelectedRecordIds().map(taskId => provider.getRecordsMap()[taskId])
        //new: your own work, behind the loading overlay and with its failure shown in a dialog
        await taskRuntime.execute(async () => {
            for (const task of tasks) {
                task.setValue('status', STATUS.done)
                task.setValue('done', 100)
                await task.save()
            }
        }, { loading: { message: 'Marking the tasks done...' }, error: { title: 'The tasks could not be marked done.', rethrow: false } })
    }

    return <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Add a check' onClick={addCheck} />
        <DefaultButton text='Mark done' onClick={markDone} />
        <Text variant='small'>{activity}</Text>
    </Stack>
}

const GridExample = () => <TaskDatasetControl onLoad={loadTasks} enableCreation enableDeletion height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* new: your own toolbar, in the control's header */}
            <PlanToolbar />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <TaskDatasetControl.Ribbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <TaskGrid modules={[createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</TaskDatasetControl>
`

const RIBBON_COMMANDS_CODE = `import { createRowSelectionModule, DatasetControl, IDatasetControl, ITaskRuntime, ITaskViewData, TaskDatasetControl, TaskGrid } from '@talxis/base-controls'
import { createLoadOffice } from './office'

const loadTasks = createLoadOffice()

//new: called on every mount, before its modules load
const onSetup = (control: IDatasetControl<ITaskViewData>) => {
    //new: the ribbon runs this hook on every load, such as when the selection changes
    control.parts.observe('ribbon', ribbon => ribbon.hooks.commands.add(commands => {
        const taskRuntime: ITaskRuntime = control.modules.get('taskRuntime')
        const [taskId, ...others] = taskRuntime.getProvider().getSelectedRecordIds()
        if (!taskId || others.length) {
            return
        }
        const { previous, next } = taskRuntime.getProvider().getRecordTree().structure.getNeighbours(taskId)
        //new: after New, Edit and Delete; a task action shows its own error
        commands.push(
            { id: 'moveUp', label: 'Move up', iconName: 'Up', disabled: !previous, onExecute: async () => { await taskRuntime.tasks.move(taskId, previous!.getRecordId(), 'above') } },
            { id: 'moveDown', label: 'Move down', iconName: 'Down', disabled: !next, onExecute: async () => { await taskRuntime.tasks.move(taskId, next!.getRecordId(), 'below') } },
        )
    }))
    //new: changes each item TaskDatasetControl.Ribbon draws: Delete is off for a top-level task
    control.modules.observe('taskRuntime', (taskRuntime: ITaskRuntime) => taskRuntime.hooks.ribbonCommandUi.add(item => {
        const { structure } = taskRuntime.getProvider().getRecordTree()
        if (item.key === 'delete' && taskRuntime.getProvider().getSelectedRecordIds().some(taskId => !structure.getParent(taskId))) {
            item.disabled = true
        }
    }))
}

const GridExample = () => <TaskDatasetControl onSetup={onSetup} onLoad={loadTasks} enableEditing enableDeletion height='480px'>
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

export const FromYourCodeExample = () => <GridExampleRunner seedCode={withOffice(FROM_YOUR_CODE_CODE)} tabs={TASK_EXAMPLE_TABS} />
export const RibbonCommandsExample = () => <GridExampleRunner seedCode={withOffice(RIBBON_COMMANDS_CODE)} tabs={TASK_EXAMPLE_TABS} />
