import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` and `pcfContext` come from the sandbox. */
export const CUSTOM_CELL_EDITOR_CODE = `const PercentCompleteEditor = (props: ITaskGridCellProps) => {
    const columnName = props.baseColumn?.name ?? ''
    const [value, setValue] = React.useState(Number(props.value.value ?? 0))

    //the grid auto-saves, so writing the value and saving the record is the whole commit
    const commit = () => {
        props.record.setValue(columnName, value)
        props.record.save()
        props.api?.stopEditing()
    }

    return <Stack height="100%" px={2} justifyContent="center">
        <Slider
            size="small"
            min={0}
            max={100}
            step={5}
            value={value}
            valueLabelDisplay="on"
            onChange={(event, next) => setValue(next as number)}
            onChangeCommitted={commit} />
    </Stack>
}

const components: Partial<ITaskGridComponents> = {
    onRenderCellEditor: (props, defaultRender) => {
        //every other column keeps the editor the grid would have used
        if (props.baseColumn?.name !== 'percentcomplete') {
            return defaultRender(props)
        }
        return <PercentCompleteEditor {...props} />
    },
}

const TaskGridExample = () => <TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    components={components} />
`

export const CustomCellEditorExample = () => <TaskGridExampleRunner seedCode={CUSTOM_CELL_EDITOR_CODE} />
