import { ITheme, mergeStyleSets } from "@fluentui/react";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { ISectionContext } from "../section";


export const CELL_LABEL_DEFAULT_WIDTH = 115;
//default in Power Apps
const CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT = 371;

const getRequirementLevelColor = (theme: ITheme, requiredLevel: RequiredLevelEnum): string | undefined => {
    switch (requiredLevel) {
        case RequiredLevelEnum.SystemRequired:
        case RequiredLevelEnum.ApplicationRequired: {
            return theme.semanticColors.errorIcon;
        }
        case RequiredLevelEnum.Recommended: {
            return theme.palette.blueMid;
        }
        default: {
            return undefined;
        }
    }
}

interface ICellStylesParams {
    requiredLevel: RequiredLevelEnum,
    theme: ITheme;
    label?: string | null
    rowspan?: number;
    section?: ISectionContext | null,
}

const getLabelWidth = (params: { section?: ISectionContext | null, cellLabelPosition: "Top" | "Left", cellLabel?: string | null }): string | undefined => {
    const { section, cellLabelPosition, cellLabel } = params;

    if (!cellLabel || cellLabelPosition === 'Top') return undefined;
    return section?.labelWidth ? `${section.labelWidth}px` : `${CELL_LABEL_DEFAULT_WIDTH}px`;
}


const getCellLabelPosition = (section?: ISectionContext | null) => {
    const { cellLabelPosition = 'Left', containerWidth, cellLabelCollapseBreakpoint = CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT } = section ?? {};

    if (cellLabelPosition !== 'Left') {
        return 'Top';
    }

    return (containerWidth ?? 0) < cellLabelCollapseBreakpoint ? 'Top' : 'Left';
}


export const getCellStyles = (params: ICellStylesParams) => {
    const { section, theme, rowspan = 1, requiredLevel } = params;
    const cellLabelPosition = getCellLabelPosition(section);
    const labelWidth = getLabelWidth({ section, cellLabelPosition, cellLabel: params.label });

    return mergeStyleSets({
        cell: {
            display: 'flex',
            flexDirection: cellLabelPosition === 'Top' ? 'column' : 'row',
            gap: 5,
            height: '100%',
            gridRow: `span ${rowspan}`,
            minHeight: 32
        },
        lockIndicator: {
            fontSize: 12,
            flexShrink: 0,
            marginLeft: 'auto',
            position: 'relative',
            top: 1
        },
        requiredLevelMark: {
            fontSize: 12,
            color: getRequirementLevelColor(theme, requiredLevel),
        },
        recommendedMark: {
            fontSize: 6,
            position: 'relative',
            top: -2
        },
        labelText: {
            overflow: 'hidden',
            padding: 0,
            textOverflow: 'ellipsis',
            overflowWrap: 'anywhere',
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '3',
            flexGrow: cellLabelPosition === 'Top' ? 0 : 1,
        },
        labelWrapper: {
            display: 'flex',
            width: labelWidth,
            gap: 5,
            flexShrink: 0
        },
        control: {
            flexGrow: 1
        },
    })
}