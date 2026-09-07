import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";

/**
 * The cell's one element.
 *
 * @param fixedHeight What the cell is worth in pixels rather than filling the row. Only a summarized row
 * in an auto-height column, which stands for a group rather than for a value.
 */
export const getCellStyles = (theme: ITheme, fixedHeight?: number) => mergeStyleSets({
    cellRoot: {
        width: '100%',
        height: fixedHeight !== undefined ? `${fixedHeight}px !important` : '100% !important',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        //the text and the font a theme provider would have applied here, without its background: a cell
        //that paints its own hides what AG Grid drew on the one behind it - the range, the flash, the
        //row's hover and selection
        color: theme.semanticColors.bodyText,
        fontFamily: theme.fonts.medium.fontFamily,
        fontSize: theme.fonts.medium.fontSize,
        fontWeight: theme.fonts.medium.fontWeight
    }
});

export const getInnerCellStyles = (isEditing: boolean, theme: ITheme, columnAlignment: IColumn['alignment'], isExpanded: boolean) => {
    return mergeStyleSets({
        innerCellRoot: {
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: '100%',
            marginLeft: isEditing ? - 1 : undefined,
            marginRight: isEditing ? - 1 : undefined,
        },
        groupToggleButtonRoot: {
            height: '100%'
        },
        groupToggleButtonIcon: {
            transition: 'transform 0.1s linear',
            fontSize: 12,
            color: theme.semanticColors.infoIcon,
            fontWeight: 600,
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
        },
        shimmerWrapper: {
            height: 10
        },
        shimmerRoot: {
            width: '100%',
            paddingLeft: 10,
            paddingRight: 10
        },
        errorIconRoot: {
            color: `${theme.semanticColors.errorIcon} !important`
        },
        uneditableIconRoot: {
            color: `${theme.semanticColors.bodyText} !important`
        }
    })
}

