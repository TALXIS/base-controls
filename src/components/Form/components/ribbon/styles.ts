import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getRibbonStyles = (theme: ITheme) => {
    return mergeStyleSets({
        ribbon: {
            padding: 0
        },
        unsavedChangesLabel: {
            fontWeight: 600,
            color: theme.semanticColors.inputText
        },
        unsavedChangesIcon: {
            '&&': {
                color: theme.palette.yellowDark
            }
        }
    });
};
