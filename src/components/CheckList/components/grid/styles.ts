import { ITheme, mergeStyleSets } from "@fluentui/react";
import { COMPLETION_COLUMN_NAME, REORDERING_CLASS_NAME } from "./constants";

export const getCheckListGridStyles = (theme: ITheme) => {
    return mergeStyleSets({
        checkListGridRoot: {
            //the grid draws a divider after the last left-pinned cell, exempting only its own control
            //column by name. The completion column is a control column too, so it takes the same
            //exemption rather than growing a border the grid's own checkbox never had.
            //`.ag-cell` is in the selector to outrank that rule: both carry !important and would
            //otherwise tie on specificity, which the later-registered stylesheet wins
            [`.ag-pinned-left-cols-container .ag-cell.ag-cell-last-left-pinned[col-id="${COMPLETION_COLUMN_NAME}"]`]: {
                borderRight: 'none !important'
            },
            //short on purpose: two rows can be crossed in quick succession during a drag, and a longer
            //transition would still be running when the next reflow starts
            [`.${REORDERING_CLASS_NAME} .ag-row`]: {
                transition: 'transform 0.15s ease-out'
            },
            //the new-record row: an input row rather than one of the items, so it reads as muted until
            //something is typed into it
            '.ag-floating-bottom .ag-row-pinned': {
                borderTop: `1px solid ${theme.semanticColors.menuDivider}`,
                backgroundColor: theme.semanticColors.bodyStandoutBackground,
                fontStyle: 'italic',
                color: theme.semanticColors.disabledText,
                ':hover': {
                    cursor: 'text'
                }
            }
        }
    })
}
