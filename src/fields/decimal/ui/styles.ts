import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getArrowButtonStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
        },
        iconButton: {
            borderRadius: 0,
            height: '50%',
            'i': {
                fontSize: 8,
            }
        },
        iconButtonActive: {
            backgroundColor: theme.semanticColors.buttonBackgroundPressed,
            'i': {
                color: theme.semanticColors.inputIconHovered
            }
        }
    })
}