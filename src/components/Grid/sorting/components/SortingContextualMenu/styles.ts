import { mergeStyleSets, ITheme } from "@fluentui/react";

export const getColumnHeaderContextualMenuStyles = (theme: ITheme) => {
    return mergeStyleSets({
        item: {
            '& .is-checked': {
                backgroundColor: theme.semanticColors.buttonBackgroundHovered,
                fontWeight: 600
            }
        }
    });
};