import { ITheme, mergeStyleSets } from "@fluentui/react";
import type { ICellProps, ISectionProps } from "../..";
import { RequiredLevelEnum } from "@talxis/client-metadata";

export type CellLabelPosition = "Top" | "Left";
export type CellLabelAlignment = "Center" | "Left" | "Right";

export const CELL_LABEL_DEFAULT_WIDTH = 115;
export const CELL_CONTROL_DEFAULT_MIN_WIDTH = 180;
export const CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT = 280;
export const CELL_LABEL_CONTROL_GAP = 5;



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

interface ICellStylesParams {
    cell: ICellProps;
    theme: ITheme;
    requirementLevel?: RequiredLevelEnum;
    cellLabelPosition: CellLabelPosition;
    section?: ISectionProps | null,
}


export const getCellStyles = (params: ICellStylesParams) => {
    const {cell, section, cellLabelPosition, theme, requirementLevel } = params;
    const rowspan = cell.rowspan ?? 1;
    const labelWidth = section?.labelWidth ?? CELL_LABEL_DEFAULT_WIDTH;

    return mergeStyleSets({
        cell: {
            display: 'flex',
            flexDirection: cellLabelPosition === 'Top' ? 'column' : 'row',
            gap: CELL_LABEL_CONTROL_GAP,
            height: '100%',
            gridRow: `span ${rowspan}`,
            ...(cell.visible === false ? { display: 'none' } : {}),
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
            width: cellLabelPosition === 'Left' ? labelWidth : '100%',
            overflow: 'hidden',
            padding: 0,
            textOverflow: 'ellipsis',
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '3',
        },
        control: {
            flexGrow: 1,
            overflow: 'auto'
        },
    })
}