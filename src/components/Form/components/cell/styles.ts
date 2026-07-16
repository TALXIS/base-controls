import { ITheme, mergeStyleSets } from "@fluentui/react";
import type { ICellProps, ISectionProps } from "../..";


export const CELL_LABEL_DEFAULT_WIDTH = 115;

const getRequirementLevelColor = (theme: ITheme, requiredLevel?: ICellProps['requiredLevel']): string | undefined => {
    switch (requiredLevel) {
        case "SystemRequired": {
            return theme.semanticColors.errorIcon;
        }
        case "ApplicationRequired":
        case "BusinessRequired": {
            return theme.palette.yellowDark
        }
        default: {
            return undefined;
        }
    }
}

interface ICellStylesParams {
    cell: ICellProps;
    cellLabelPosition: "Top" | "Left";
    theme: ITheme;
    section?: ISectionProps | null,
}


export const getCellStyles = (params: ICellStylesParams) => {
    const { cell, section, theme, cellLabelPosition } = params;
    const rowspan = cell.rowspan ?? 1;
    const labelWidth = section?.labelWidth ?? CELL_LABEL_DEFAULT_WIDTH;

    return mergeStyleSets({
        cell: {
            display: 'flex',
            flexDirection: cellLabelPosition === 'Top' ? 'column' : 'row',
            gap: 5,
            height: '100%',
            gridRow: `span ${rowspan}`,
            ...(cell.visible === false ? { display: 'none' } : {}),
        },
        lockIndicator: {
            fontSize: 12,
            flexShrink: 0,
        },
        lockSlot: {
            width: 12,
        },
        requiredMark: {
            fontSize: 12,
            position: 'relative',
            top: 2,
            color: getRequirementLevelColor(theme, cell.requiredLevel),
        },
        labelText: {
            overflow: 'hidden',
            padding: 0,
            textOverflow: 'ellipsis',
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '3',
        },
        labelWrapper: {
            display: 'flex',
            width: cellLabelPosition === 'Left' ? labelWidth : '100%',
            gap: 5
        },
        control: {
            flexGrow: 1,
            overflow: 'auto'
        },
    })
}