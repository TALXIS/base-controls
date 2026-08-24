import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const CUSTOM_CELL_RENDERER_CODE = `/** Priority option value → the MUI palette colour that carries the same meaning. */
const PRIORITY_COLORS: Record<number, 'default' | 'info' | 'warning' | 'error'> = {
    0: 'default',
    1: 'info',
    2: 'warning',
    3: 'error',
}

const PriorityCell = (props: ITaskGridCellProps) => {
    const option = props.baseColumn?.metadata?.OptionSet?.find(option => option.Value == props.value.value)
    if (!option) {
        return <></>
    }
    return <Stack height="100%" px={1} justifyContent="center" alignItems="flex-start">
        <Chip size="small" label={option.Label} color={PRIORITY_COLORS[Number(option.Value)] ?? 'default'} />
    </Stack>
}

const components: Partial<ITaskGridComponents> = {
    onRenderCellRenderer: (props, defaultRender) => {
        //every other column, and the loading state of this one, stay with the grid's own cell
        if (props.baseColumn?.name !== 'priority' || props.value.loading) {
            return defaultRender(props)
        }
        return <PriorityCell {...props} />
    },
}

const TaskGridExample = () => <TaskGrid
    taskGridDescriptor={descriptor}
    components={components} />
`

export const CustomCellRendererExample = () => <TaskGridExampleRunner seedCode={CUSTOM_CELL_RENDERER_CODE} />
