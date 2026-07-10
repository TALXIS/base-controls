import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTabStyles = (theme: ITheme) => {
    return mergeStyleSets({
        panel: {
            padding: "0 4px",
        },
        heading: {
            marginBottom: 12,
            color: theme.semanticColors.bodyText,
        },
    });
};
