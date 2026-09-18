import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getDatePreviewCalloutStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            padding: '6px 10px',
            fontSize: 12,
            fontWeight: 500,
            color: theme.semanticColors.bodyText,
        },
    });
};
