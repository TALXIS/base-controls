import { mergeStyles } from "@fluentui/react";
import {
    GANTT_DATA_AREA_CLASS,
    GANTT_TASK_BG_CLASS,
    GANTT_TASK_CELL_CLASS,
    GANTT_TASK_LINE_CLASS,
} from "../../classNames";

/** Everything the chart offers as grabbable, which is what the band takes over. */
const GRABBABLE = [
    `.${GANTT_TASK_BG_CLASS}`,
    `.${GANTT_TASK_CELL_CLASS}`,
    `.${GANTT_DATA_AREA_CLASS}`,
    `.${GANTT_TASK_LINE_CLASS}`,
    `.${GANTT_TASK_LINE_CLASS} *`,
    '.gantt_left',
];

/**
 * What the chart's cursors become while shift is held: nothing offers to be dragged, because the next drag
 * draws a selection band instead of moving a bar.
 *
 * A class the module toggles on `$root`, rather than a rule in the timeline's stylesheet, so the feature
 * takes its cursor with it when it is not registered. Doubled (`&&`) to outweigh the timeline's own
 * two-class `grab` rules, which would otherwise win on source order.
 */
export const getSelectionBoxCursorStyles = () => {
    return mergeStyles({
        selectors: {
            '&&': {
                cursor: 'default',
            },
            [GRABBABLE.map(selector => `&& ${selector}`).join(', ')]: {
                cursor: 'default',
            },
        },
    });
};
