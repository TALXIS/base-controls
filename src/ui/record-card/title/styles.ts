import { FontWeights, ITheme, mergeStyleSets } from "@fluentui/react";

export const getRecordCardTitleStyles = (theme: ITheme) => mergeStyleSets({
    title: {
        ...theme.fonts.mediumPlus,
        fontWeight: FontWeights.semibold,
        lineHeight: '22px',
        color: theme.semanticColors.bodyText,
        wordBreak: 'break-word',
    },
});
