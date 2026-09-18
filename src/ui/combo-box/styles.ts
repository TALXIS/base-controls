import { IComboBoxOptionStyles, IsFocusVisibleClassName, ITheme } from "@fluentui/react";

/**
 * What an option is drawn in, where the surface it is drawn on is not the theme the input has.
 *
 * A combo box works its option styles out from its own theme before the callout exists, so a context around
 * the list never reaches them - what the surface answers for goes back in through the props Fluent takes.
 */
export const getSurfaceOptionStyles = (surfaceTheme: ITheme): Partial<IComboBoxOptionStyles> => {
    const { semanticColors, palette } = surfaceTheme;
    return {
        root: {
            selectors: {
                //Fluent's own ring, on the option the list opened on: recoloured where it is drawn, not redrawn
                [`.${IsFocusVisibleClassName} &:after`]: {
                    borderColor: palette.white,
                    outlineColor: palette.neutralSecondary
                },
                //the option the list opened on carries a hover of its own, from the input's theme again
                '&:hover': {
                    backgroundColor: semanticColors.menuItemBackgroundHovered,
                    color: semanticColors.menuItemTextHovered
                },
                '&.ms-Button--command:hover:active': {
                    backgroundColor: semanticColors.menuItemBackgroundPressed
                }
            }
        },
        rootHovered: {
            backgroundColor: semanticColors.menuItemBackgroundHovered,
            color: semanticColors.menuItemTextHovered
        },
        rootFocused: {
            backgroundColor: semanticColors.menuItemBackgroundHovered
        },
        rootPressed: {
            backgroundColor: semanticColors.menuItemBackgroundPressed,
            color: semanticColors.menuItemTextHovered
        },
        rootDisabled: {
            color: semanticColors.disabledText
        },
        optionText: {
            color: semanticColors.menuItemText
        }
    };
};
