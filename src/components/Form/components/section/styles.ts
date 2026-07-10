import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getSectionStyles = (theme: ITheme, showBar: boolean | undefined) => {
    return mergeStyleSets({
        root: {
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            borderRadius: 2,
            backgroundColor: theme.semanticColors.bodyBackground,
            overflow: "hidden",
        },
        header: {
            display: showBar !== false ? "flex" : "none",
            alignItems: "center",
            padding: "8px 12px",
            backgroundColor: theme.semanticColors.bodyBackgroundChecked,
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
        },
        title: {
            fontSize: theme.fonts.medium.fontSize,
            fontFamily: theme.fonts.medium.fontFamily,
            fontWeight: 600,
            color: theme.semanticColors.bodyText,
            margin: 0,
        },
        body: {
            padding: 12,
        },
    });
};
