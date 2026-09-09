import { ITheme, mergeStyleSets } from "@fluentui/react";
import { getJustifyContent } from "@utils";

export const getCellStyles = (theme: ITheme, alignment: 'left' | 'center' | 'right') => {
    return mergeStyleSets({
        cellRoot: {
            width: '100%',
            height: '100% !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            //the text and the font a theme provider would have applied here, without its background: a cell
            //that paints its own hides what AG Grid drew on the one behind it - the range, the flash, the
            //row's hover and selection
            color: theme.semanticColors.bodyText,
            fontFamily: theme.fonts.medium.fontFamily,
            fontSize: theme.fonts.medium.fontSize,
            fontWeight: theme.fonts.medium.fontWeight,
        },
        contentRoot: {
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: getJustifyContent(alignment),
            height: '100%',
        },
    });
};
