import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTotalValueStyles = (theme: ITheme) => mergeStyleSets({
    total: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        //a total reads from the right whatever the column it totals does
        alignItems: 'flex-end',
        width: '100%',
        //the inset is the width's, not on top of it: the cell clips whatever is drawn past its edge
        boxSizing: 'border-box',
        minWidth: 0,
        overflow: 'hidden',
        //what a value drawn by the grid's own renderer is inset by
        paddingLeft: 9,
        paddingRight: 9,
    },
    label: {
        color: theme.semanticColors.bodySubtext,
        fontSize: theme.fonts.small.fontSize,
        //taller than the font's own box, which `overflow` cuts into as soon as a line box rounds down
        lineHeight: '18px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
    },
    value: {
        fontWeight: theme.fonts.medium.fontWeight,
        lineHeight: '18px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
    },
});
