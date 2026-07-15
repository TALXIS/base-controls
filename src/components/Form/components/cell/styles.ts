import { ITheme, mergeStyleSets } from "@fluentui/react";
import { ICell, ISection } from "../..";
import { RequiredLevelEnum } from "@talxis/client-metadata";

export type CellLabelPosition = "Top" | "Left";
export type CellLabelAlignment = "Center" | "Left" | "Right";

export interface ICellStylesParams {
    cell: ICell;
    section: ISection | null;
    theme: ITheme;
    requirementLevel?: RequiredLevelEnum;
}

//could be props on CELL?
const LABEL_DEFAULT_WIDTH = 115;
const LABEL_TOP_BREAKPOINT = 180;
const DEFAULT_CELL_SPAN = 1;
const DEFAULT_CELL_ROWSPAN = 1;
export const DEFAULT_CELL_MIN_WIDTH = '180px';

const getFlexDirection = (section: ISection | null) => {
    //if no section render => block
    if (!section) return 'column';
    //otherwise default is flex unless the section has a label position of "Top"
    return section.cellLabelPosition === 'Top' ? 'column' : 'row';
}

const getRequirementLevelColor = (theme: ITheme, requirementLevel?: RequiredLevelEnum): string | undefined => {
    switch (requirementLevel) {
        case RequiredLevelEnum.SystemRequired: {
            return theme.semanticColors.errorIcon;
        }
        case RequiredLevelEnum.ApplicationRequired:
        case RequiredLevelEnum.Recommended: {
            return theme.palette.yellowDark
        }
        default: {
            return undefined;
        }
    }
}

export const getCellStyles = ({ cell, section, requirementLevel, theme }: ICellStylesParams) => {
    const labelWidth = section?.labelWidth ?? LABEL_DEFAULT_WIDTH;
    const labelTopBreakpoint = section?.cellLabelTopBreakpoint ?? LABEL_TOP_BREAKPOINT;
    const colSpan = cell.colspan ?? DEFAULT_CELL_SPAN;
    const rowSpan = cell.rowspan ?? DEFAULT_CELL_ROWSPAN;

    return mergeStyleSets({
        cell: {
            display: 'flex',
            flexDirection: getFlexDirection(section),
            gap: 5,
            height: '100%',
            minWidth: `min(100%, ${DEFAULT_CELL_MIN_WIDTH})`,
            gridColumn: `span ${colSpan}`,
            gridRow: `span ${rowSpan}`,
            ...(cell.visible === false ? { display: 'none' } : {}),
            [`@container (max-width: ${labelTopBreakpoint}px)`]: {
                flexDirection: 'column',
            }
        },
        lockIcon: {
            fontSize: 12,
            flexShrink: 0,
        },
        lockSpacer: {
            width: 16,
            height: 16,
        },
        labelContainer: {
            display: 'flex',
            gap: 5,
            minWidth: 0,
            flexShrink: 1
        },
        requiredIndicator: {
            fontSize: 12,
            position: 'relative',
            top: 2,
            color: getRequirementLevelColor(theme, requirementLevel),
        },
        label: {
            width: labelWidth,
            overflow: 'hidden',
            padding: 0,
            textOverflow: 'ellipsis',
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '3',
             [`@container (max-width: ${labelTopBreakpoint}px)`]: {
                width: '100%'
            }
        },
        control: {
            flexGrow: 1,
            overflow: 'auto'
        },
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
