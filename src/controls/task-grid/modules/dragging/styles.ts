import { IStyle, ITheme } from "@fluentui/react";
import { TASK_ROW_CLASS_NAMES } from "../../constants";

export const getTaskDraggingStyles = (theme: ITheme, rowSlideMs: number): IStyle => ({
    selectors: {
        [`.${TASK_ROW_CLASS_NAMES.dropTarget}`]: { outline: `1px solid ${theme.palette.themePrimary}`, outlineOffset: '-1px' },
        //above the pinned cells AG Grid stacks over the row
        [`.${TASK_ROW_CLASS_NAMES.dropTarget}::before`]: { content: "''", position: 'absolute', inset: 0, zIndex: 3, backgroundColor: theme.palette.themePrimary, opacity: 0.12, pointerEvents: 'none' },
        '.ag-row': { transitionDuration: `${rowSlideMs}ms` },
        [`.${TASK_ROW_CLASS_NAMES.draggable}`]: { cursor: 'grab' },
    },
});
