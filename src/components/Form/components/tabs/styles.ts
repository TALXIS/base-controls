import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTabsStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
        },
        pivot: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            marginBottom: 16,
        },
        panel: {
            flex: 1,
        },
    });
};
