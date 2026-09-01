import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getProjectMarkerStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            backgroundColor: theme.palette.yellow
        },
    });
};