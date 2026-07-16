import { ITheme, mergeStyleSets } from "@fluentui/react";
import type { ICellProps, ISectionProps } from "../..";
import { RequiredLevelEnum } from "@talxis/client-metadata";

export type CellLabelPosition = "Top" | "Left";
export type CellLabelAlignment = "Center" | "Left" | "Right";

export interface ICellStylesParams {
    labelWidth?: number;
    labelCollapseBreakpoint?: number;
    cell: ICellProps;
    section: ISectionProps | null;
    theme: ITheme;
    requirementLevel?: RequiredLevelEnum;
}

export const CELL_LABEL_DEFAULT_WIDTH = 115;
export const CELL_CONTROL_DEFAULT_MIN_WIDTH = 180;
export const CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT = 280;
export const CELL_LABEL_CONTROL_GAP = 5;


const DEFAULT_CELL_SPAN = 1;
const DEFAULT_CELL_ROWSPAN = 1;

const getFlexDirection = (section: ISectionProps | null) => {
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

export const getCellStyles = ({ cell, section, requirementLevel, theme, labelWidth, labelCollapseBreakpoint }: ICellStylesParams) => {
    labelWidth = labelWidth ?? CELL_LABEL_DEFAULT_WIDTH;
    labelCollapseBreakpoint = labelCollapseBreakpoint ?? CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT;
    const colSpan = cell.colspan ?? DEFAULT_CELL_SPAN;
    const rowSpan = cell.rowspan ?? DEFAULT_CELL_ROWSPAN;

    return mergeStyleSets({
        cell: {
            display: 'flex',
            flexDirection: getFlexDirection(section),
            gap: CELL_LABEL_CONTROL_GAP,
            height: '100%',
            gridColumn: `span ${colSpan}`,
            gridRow: `span ${rowSpan}`,
            ...(cell.visible === false ? { display: 'none' } : {}),
            [`@container (max-width: ${labelCollapseBreakpoint}px)`]: {
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
            flexShrink: 0
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
             [`@container (max-width: ${labelCollapseBreakpoint}px)`]: {
                width: '100%'
            }
        },
        control: {
            flexGrow: 1,
            overflow: 'auto'
        },
    })
}