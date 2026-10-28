import { AnimationStyles, ITheme, mergeStyleSets } from "@fluentui/react";

export const getLoadingOverlayStyles = (theme: ITheme) => mergeStyleSets({
    overlay: {
        ...AnimationStyles.fadeIn200,
        //the largest z-index browsers allow
        zIndex: 2147483647,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        //a tint of the theme's surface, blurred behind like Fluent's acrylic
        backgroundColor: `color-mix(in srgb, ${theme.semanticColors.bodyBackground} 70%, transparent)`,
        backdropFilter: 'blur(4px)',
    },
    message: {
        color: theme.semanticColors.bodyText,
        fontWeight: 600,
    },
});
