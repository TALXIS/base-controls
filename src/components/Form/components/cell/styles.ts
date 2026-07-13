import { ITheme, mergeStyleSets } from "@fluentui/react";

export type CellLabelPosition = "Top" | "Left";
export type CellLabelAlignment = "Center" | "Left" | "Right";

const CONTENT_MIN_WIDTH = 80;

export const getCellStyles = () => {
    return mergeStyleSets({
        cell: {
            
        },
        labelContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: 5
        }
    })
}

export const getCellStyles2 = (
    theme: ITheme,
    labelPosition: CellLabelPosition,
    labelAlignment: CellLabelAlignment,
    labelWidth: number | undefined,
    labelTopBreakpoint: number | undefined,
    colspan: number | undefined,
    rowspan: number | undefined,
) => {
    return mergeStyleSets({
        cell: {
        },
        label: {

        },
        labelContainer: {

        },
        content: {

        },
        error: {

        }
    });


/*     const gridColumn = colspan && colspan > 1 ? `span ${colspan}` : undefined;
    const gridRow = rowspan && rowspan > 1 ? `span ${rowspan}` : undefined;

    // For "Left" position, use flex-wrap so the label moves on top automatically
    // when the container is too narrow (label + CONTENT_MIN_WIDTH + gap > container width).
    const resolvedLabelWidth = labelWidth ?? 140;
    const innerLayout = labelPosition === "Left"
        ? {
            display: "flex",
            flexWrap: "wrap" as const,
            alignItems: "flex-start",
            gap: "4px 12px",
        }
        : {
            display: "flex",
            flexDirection: "column" as const,
            gap: 4,
        };

    const labelLayout = labelPosition === "Left"
        ? {
            // Fixed label width; when it can't fit alongside content min-width it wraps
            flex: `0 0 ${resolvedLabelWidth}px`,
            maxWidth: `${resolvedLabelWidth}px`,
        }
        : {};

    const contentLayout = labelPosition === "Left"
        ? {
            // Grows to fill remaining space; min-width forces wrapping when space is tight
            flex: `1 1 ${CONTENT_MIN_WIDTH}px`,
            minWidth: CONTENT_MIN_WIDTH,
        }
        : {};

    const leftToTopContainerQuery = labelPosition === "Left" && labelTopBreakpoint
        ? {
            [`@container (max-width: ${labelTopBreakpoint}px)`]: {
                flexDirection: "column",
                flexWrap: "nowrap",
                gap: 4,
            },
        }
        : {};

    const labelContainerQuery = labelPosition === "Left" && labelTopBreakpoint
        ? {
            [`@container (max-width: ${labelTopBreakpoint}px)`]: {
                flex: "1 1 auto",
                maxWidth: "100%",
                paddingTop: 0,
            },
        }
        : {};

    const contentContainerQuery = labelPosition === "Left" && labelTopBreakpoint
        ? {
            [`@container (max-width: ${labelTopBreakpoint}px)`]: {
                flex: "1 1 auto",
                minWidth: 0,
                width: "100%",
            },
        }
        : {};

    return mergeStyleSets({
        root: {
            gridColumn,
            gridRow,
            padding: "4px 0",
            minWidth: 0,
            ...innerLayout,
            ...leftToTopContainerQuery,
        },
        label: {
            ...labelLayout,
            fontSize: theme.fonts.small.fontSize,
            fontFamily: theme.fonts.small.fontFamily,
            color: theme.semanticColors.bodySubtext,
            fontWeight: 600,
            textAlign: labelAlignment.toLowerCase() as "left" | "center" | "right",
            paddingTop: labelPosition === "Left" ? 6 : 0,
            ...labelContainerQuery,
        },
        content: {
            ...contentLayout,
            minWidth: labelPosition === "Left" ? CONTENT_MIN_WIDTH : undefined,
            ...contentContainerQuery,
        },
        error: {
            fontSize: theme.fonts.xSmall.fontSize,
            color: theme.semanticColors.errorText,
            marginTop: 2,
        },
    }); */
};
