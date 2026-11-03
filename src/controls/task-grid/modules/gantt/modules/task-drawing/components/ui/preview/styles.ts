import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskDrawingUiPreviewStyles = (theme: ITheme, applicationTheme: ITheme) => mergeStyleSets({
    row: {
        position: 'absolute',
        left: 0,
        right: 0,
        backgroundColor: theme.palette.themeLighterAlt,
        opacity: 0.8,
        pointerEvents: 'none',
        zIndex: 3,
    },
    span: {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: 4,
        backgroundColor: theme.palette.themeTertiary,
    },
    text: {
        padding: '6px 10px',
        fontSize: applicationTheme.fonts.small.fontSize,
        fontWeight: 500,
        color: applicationTheme.semanticColors.bodyText,
        pointerEvents: 'none',
    },
});
