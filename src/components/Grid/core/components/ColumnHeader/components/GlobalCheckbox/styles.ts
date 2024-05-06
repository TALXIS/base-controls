import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getGlobalCheckboxStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            backgroundColor: theme.palette.white,
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'center',
            position: 'relative',
            left: 1
        }
    });
}