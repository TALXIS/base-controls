import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderMenuStyles = (theme: ITheme) => {
    return mergeStyleSets({
        menu: {
            //Fluent marks a checked entry with an icon the entry's own icon has taken
            '.ms-ContextualMenu-link.is-checked': {
                backgroundColor: theme.semanticColors.buttonBackgroundHovered,
                fontWeight: 600
            }
        }
    });
};
