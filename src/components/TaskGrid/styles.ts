import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getDatasetControlStyles = (theme: ITheme) => {
    return mergeStyleSets({
        datasetControlRoot: {
            height: '100%',
            '.talxis_task-grid_row--drag-over-middle': {
                '::after': {
                    display: 'block',
                    content: "''",
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.palette.themePrimary,
                    opacity: 0.2,
                    position: 'absolute',
                    top: 0,
                }
            },
            '.talxis_task-grid_row--drag-over-top::after': {
                display: 'block',
                content: "''",
                width: '100%',
                position: 'absolute',
                top: 1,
                outline: `1px solid ${theme.semanticColors.inputFocusBorderAlt}`
            },
            '.ag-cell-auto-height': {
                backgroundColor: theme.semanticColors.bodyBackground
            },
            '.talxis__baseControl__GridCellRenderer [class^="colorfulOptionValueRendererRoot"]': {
                maxWidth: '100%',
                textAlign: 'center'
            },
            '.talxis_task-grid_row--drag-over-bottom::after': {
                display: 'block',
                content: "''",
                width: '100%',
                position: 'absolute',
                //TODO: remove hardcoded top
                top: 41,
                outline: `1px solid ${theme.semanticColors.inputFocusBorderAlt}`
            },
            '.talxis_task-grid_row--inactive': {
                '[class^="notificationsRoot"]': {
                    display: 'none'
                },
                ':not(.talxis_task-grid_row--drag-over-top):not(.talxis_task-grid_row--drag-over-bottom):not(.talxis_task-grid_row--drag-over-middle)::after': {
                    display: 'block',
                    content: "''",
                    width: '100%',
                    height: '100%',
                    backgroundColor: theme.semanticColors.disabledBackground,
                    opacity: 0.3,
                    pointerEvents: 'none',
                    position: 'absolute',
                    top: 0
                }
            },
            '.talxis_task-grid_row--unmatched-parent': {
                '.ag-cell [class^="valueContainer"]': {
                    fontStyle: 'italic !important',
                    '>span': {
                        marginRight: 1
                    }
                }
            }
        }
    })
}