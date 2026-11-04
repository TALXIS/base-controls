import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";

export const getPageSizeSwitcherUiStyles = (theme: ITheme) => mergeStyleSets({
    datasetControlPageSizeSwitcher: {
        height: 44,
    },
    pageSize: {
        '.is-checked': {
            backgroundColor: theme.semanticColors.buttonBackgroundHovered,
            fontWeight: 600,
        },
    },
});
