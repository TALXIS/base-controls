import { mergeStyleSets } from "@fluentui/react"

export const getAddTaskButtonStyles = () => {
    return mergeStyleSets({
        addTaskBtnRoot: {
            width: '100% !important',
            height: '100% !important',
            display: 'none',
            ':global(.ag-row-focus, .ag-row-selected, .ag-row-hover)': {
                '.talxis_task-grid_add-task-button': {
                    display: 'block'
                }
            }
        },
        addTaskMenuIcon: {
            display: 'none'
        },
        uneditableIconContainer: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        uneditableIcon: {
            fontSize: 16
        },
    })
}