import { ITheme, mergeStyleSets } from "@fluentui/react";
import { COMPLETED_CLASS_NAME, REORDERING_CLASS_NAME } from "./constants";

export const getCheckListGridStyles = (theme: ITheme) => {
    return mergeStyleSets({
        checkListGridRoot: {
            //a finished item reads as struck through. Set on the cell rather than on the text inside it,
            //which the grid's own renderer owns - a decoration from an ancestor is drawn over every
            //inline descendant and cannot be turned off further down
            [`.ag-cell.${COMPLETED_CLASS_NAME}`]: {
                textDecoration: 'line-through'
            },
            //short on purpose: two rows can be crossed in quick succession during a drag, and a longer
            //transition would still be running when the next reflow starts
            [`.${REORDERING_CLASS_NAME} .ag-row`]: {
                transition: 'transform 0.15s ease-out'
            }
        }
    })
}
