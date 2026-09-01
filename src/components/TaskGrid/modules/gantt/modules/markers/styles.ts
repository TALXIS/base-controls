import { mergeStyles } from "@fluentui/react";

/**
 * The colour of a marker's line, as a class.
 *
 * A class rather than an inline style because the chart rebuilds every marker element as it renders, and
 * the only thing it carries over is the marker's `css`. Doubled (`&&`) to outweigh the library's own
 * single-class `.gantt_marker` colour, which would otherwise win on source order.
 */
export const getMarkerLineStyles = (color: string) => {
    return mergeStyles({
        selectors: {
            '&&': {
                backgroundColor: color,
            },
        },
    });
};
