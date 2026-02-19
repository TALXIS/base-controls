import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getControlComponentLoadingStyles = () => {
    return mergeStyleSets({
        loadingRoot: {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 80
        }
    });
}