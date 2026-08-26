import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getChecklistCellRendererStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            height: '100%',
            paddingRight: 8,
            paddingLeft: 8,
            //the count reads as text; only the glyph carries the state
            color: theme.semanticColors.bodyText,
        },
        icon: {
            fontSize: 14,
            color: theme.semanticColors.bodySubtext,
        },
        //everything ticked: the one state worth spotting without reading the numbers
        iconCompleted: {
            fontSize: 14,
            color: theme.semanticColors.successIcon,
        },
    })
}
