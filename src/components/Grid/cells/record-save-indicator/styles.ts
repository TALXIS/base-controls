import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getRecordSaveIndicatorStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        saveSuccessBtn: {
            color: theme.semanticColors.successIcon,
        },
        saveErrorBtn: {
            color: theme.semanticColors.errorIcon,
        }
    })
}
