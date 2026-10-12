import React from 'react'
import { TaskGridExampleRunner } from './TaskGridExampleRunner'

/** Seed snippet of the example. `descriptor` comes from the sandbox. */
export const CUSTOM_CELL_EDITOR_CODE = `const PercentSlider = () => {
    const field = useGridField()!
    const [value, setValue] = React.useState(Number(field.getValue() ?? 0))

    //the value sits beside the slider rather than above it - a label over the thumb is clipped by the row
    return <Stack direction="row" spacing={1} px={1} alignItems="center">
        <Slider
            size="small"
            sx={{ flex: 1, minWidth: 0 }}
            min={0}
            max={100}
            step={5}
            value={value}
            onChange={(event, next) => setValue(next as number)}
            onChangeCommitted={(event, next) => field.setValue(next as number)} />
        <Typography variant="caption" flexShrink={0}>{value}%</Typography>
    </Stack>
}

const SLIDER_EDITOR: IEditingCellEditorComponents = {
    columnControl: { onRenderControl: () => <PercentSlider /> },
}

const PercentCompleteEditor = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <EditingCell.Editor {...props} components={SLIDER_EDITOR} />
</Grid.Cell.Field>

const TaskGridExample = () => <TaskGrid
    descriptor={descriptor}
    colDefs={{
        percentcomplete: { cellEditor: PercentCompleteEditor },
    }} />
`

export const CustomCellEditorExample = () => <TaskGridExampleRunner seedCode={CUSTOM_CELL_EDITOR_CODE} />
