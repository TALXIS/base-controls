import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const FLAKY_GANTT_CODE = `import { Stack, Text, Toggle } from '@fluentui/react'

const fieldMapping: IFieldMapping = {
    parentId: 'parentid',
    subject: 'subject',
    stackRank: 'stackrank',
    stateCode: 'statecode',
    startDate: 'scheduledstart',
    endDate: 'scheduledend',
    duration: 'scheduleddurationminutes',
    percentComplete: 'percentcomplete',
}

const VIEWS: ITaskGridView[] = [
    { id: 'all', name: 'All tasks', resolve: () => ({ columns: getTaskColumns('subject', 'scheduledstart', 'scheduledend', 'scheduleddurationminutes'), data: {} }) },
]

//fails about every other load, so Try again on the Gantt is worth pressing a few times
const flakyModule = {
    name: 'flaky',
    onLoad: async () => {
        await new Promise(resolve => setTimeout(resolve, 800))
        if (Math.random() < 0.5) {
            throw new Error('The flaky Gantt module failed to load.')
        }
        return {}
    },
}

const GridExample = () => {
    const taskTable = React.useMemo(() => new MemoryTable({ idKey: TASK_METADATA.PrimaryIdAttribute, rows: TASKS }), [])
    const [isGanttShown, setIsGanttShown] = React.useState(true)
    const [log, setLog] = React.useState<string[]>([])
    const write = (entry: string) => setLog(entries => [new Date().toLocaleTimeString() + '  ' + entry, ...entries].slice(0, 8))
    const modules = React.useMemo(() => [createRowSelectionModule({ mode: 'multiple' }), createTaskEditingModule()], [])
    const ganttModules = React.useMemo(() => [createLibraryModule(), flakyModule], [])

    const onLoad = async (taskRuntime: ITaskRuntime): Promise<ITaskGridLoadResult> => {
        return { store: new MemoryTaskStore({ taskRuntime, tasks: taskTable, metadata: TASK_METADATA, columns: TASK_COLUMNS }), fieldMapping, views: VIEWS }
    }

    const onGanttSetup = (gantt: IGantt) => {
        gantt.lifecycle.events.addEventListener('onStatusChanged', status => {
            if (status === 'ready') {
                write('Gantt ready: the chart is drawn')
            }
            if (status === 'failed') {
                write('Gantt failed: ' + (gantt.lifecycle.getError() as Error).message)
            }
        })
    }

    return <Stack tokens={{ childrenGap: 12 }} styles={{ root: { height: '100%' } }}>
        <Stack horizontal tokens={{ childrenGap: 24 }} verticalAlign='start'>
            <Toggle label='Show the Gantt' inlineLabel checked={isGanttShown} onChange={(_, checked) => setIsGanttShown(!!checked)} />
            <Stack>
                {log.map((entry, index) => <Text key={index} variant='small' styles={{ root: { fontFamily: 'Consolas, monospace' } }}>{entry}</Text>)}
            </Stack>
        </Stack>
        <Stack.Item grow styles={{ root: { minHeight: 0 } }}>
            <TaskDatasetControl enableCreation enableEditing enableDeletion stateKey='devFlakyGantt' height='100%' onLoad={onLoad}
                onReady={() => write('Dataset control onReady: the grid and the Gantt are settled')}>
                <DatasetControl.Header>
                    <DatasetControl.Header.End>
                        <TaskDatasetControl.Ribbon />
                    </DatasetControl.Header.End>
                </DatasetControl.Header>
                <DatasetControl.Body>
                    {isGanttShown
                        ? <TaskGantt.Split stateKey='ganttSplit'>
                            <TaskGrid stateKey='taskGrid' modules={modules} />
                            <TaskGantt stateKey='gantt' modules={ganttModules} onSetup={onGanttSetup} />
                        </TaskGantt.Split>
                        : <TaskGrid stateKey='taskGrid' modules={modules} />}
                </DatasetControl.Body>
            </TaskDatasetControl>
        </Stack.Item>
    </Stack>
}
`

/** The task grid with a Gantt whose modules fail to load about every other time. */
export const FlakyGanttTaskGrid = () => <GridExampleRunner seedCode={FLAKY_GANTT_CODE} />
