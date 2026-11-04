import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getFooterUiStyles = (theme: ITheme) => mergeStyleSets({
    datasetControlFooter: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        flexShrink: 0,
        borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
    },
});
