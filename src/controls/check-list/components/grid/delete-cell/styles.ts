import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getDeleteCellStyles = (theme: ITheme) => {
    return mergeStyleSets({
        deleteButtonRoot: {
            width: '100% !important',
            height: '100% !important',
            display: 'none',
            ':global(.ag-row-focus, .ag-row-selected, .ag-row-hover)': {
                '.talxis_check-list_delete-button': {
                    display: 'block'
                }
            }
        },
        deleteButtonIcon: {
            color: theme.semanticColors.errorIcon,
            fontSize: 12,
            height: 12,
            lineHeight: 12
        }
    })
}
