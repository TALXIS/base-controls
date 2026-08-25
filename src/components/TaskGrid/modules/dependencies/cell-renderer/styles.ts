import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getDependenciesCellRendererStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            height: '100%',
            paddingRight: 8,
            paddingLeft: 8,
            //only the link glyph carries the accent; the direction and the count read as text
            color: theme.semanticColors.bodyText,
        },
        icon: {
            fontSize: 14,
            color: theme.palette.themePrimary,
        },
        arrow: {
            fontSize: 12,
        },
    })
}
