import type { IStyle } from "@fluentui/react";
import { TASK_DRAWING_ARMED_CLASS } from "./classNames";

export const getTaskDrawingStyles = (): IStyle => ({
    //doubled to outweigh the chart's grab cursors while the next drag draws a task
    [`&.${TASK_DRAWING_ARMED_CLASS}.${TASK_DRAWING_ARMED_CLASS}, &.${TASK_DRAWING_ARMED_CLASS}.${TASK_DRAWING_ARMED_CLASS} *`]: {
        cursor: 'copy',
    },
});
