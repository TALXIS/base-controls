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

const PriorityChip = () => {
    const field = useGridField()!
    const label = field.getFormattedValue()
    if (!label) {
        return null
    }
    return <Stack height="100%" px={1} justifyContent="center" alignItems="flex-start">
        <Chip size="small" label={label} color={PRIORITY_COLORS[Number(field.getValue())] ?? 'default'} />
    </Stack>
}

//only the value is replaced: loading, validation, commands and editing stay the grid's own
const PRIORITY_CELL: ICellRendererComponents = {
    columnControl: { onRenderControl: () => <PriorityChip /> },
}

const PriorityCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Renderer {...props} components={PRIORITY_CELL} />
</Grid.Cell.Field>

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    colDefs={{
        priority: { cellRenderer: PriorityCell },
    }} />
`

export const CustomCellRendererExample = () => <TaskGridExampleRunner seedCode={CUSTOM_CELL_RENDERER_CODE} />
