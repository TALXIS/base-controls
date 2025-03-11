import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getGlobalCheckboxStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            backgroundColor: theme.semanticColors.bodyBackground,
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'center'
        },
        checkbox: {
            marginRight: 0.5
        }
    });
}