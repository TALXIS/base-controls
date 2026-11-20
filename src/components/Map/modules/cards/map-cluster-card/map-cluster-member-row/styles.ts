import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getMapClusterMemberRowStyles = (theme: ITheme) => {
    return mergeStyleSets({
        label: {
            fontSize: theme.fonts.medium.fontSize,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }
    });
};
