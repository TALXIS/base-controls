import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getRibbonStyles = (theme: ITheme) => {
    return mergeStyleSets({
        ribbon: {
            padding: 0,

            boxShadow: theme.effects.elevation4,
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
        },
        unsavedChangesLabel: {
            fontWeight: 600,
            color: theme.semanticColors.inputText
        },
        unsavedChangesIcon: {
            color: `${theme.palette.yellowDark} !important`
        },
        savedIcon: {
            color: `${theme.palette.greenDark} !important`
        }
    });
};
