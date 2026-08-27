import { ITheme, mergeStyleSets } from "@fluentui/react";

/**
 * Put on the grid root only while a row is being dragged. The row transition hangs off this rather than
 * being always on: the grid rewrites row transforms as it recycles rows while scrolling a long list, and
 * a permanent transition animates every one of those — which reads as the whole list moving in slow
 * motion. The customizer toggles it, and the selector below is the only thing that reads it.
 */
export const REORDERING_CLASS_NAME = 'talxis_check-list--reordering';

export const getCheckListGridStyles = (theme: ITheme) => {
    return mergeStyleSets({
        checkListGridRoot: {
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
