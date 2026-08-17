import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getMultiValueContainerStyles = (theme: ITheme, isDisabled?: boolean, height?: number) => {
    return mergeStyleSets({
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: theme.palette.neutralLighter,
            border: `1px solid ${theme.palette.neutralLight}`,
            borderRadius: 2,
            margin: '2px 4px 2px 0',
            padding: '1px 4px',
            paddingRight: isDisabled ? 4 : 0,
            fontSize: 12,
            color: theme.palette.neutralPrimary,
            maxWidth: 200,
            overflow: 'hidden',
            height: height ?? 20
        },
    });
};
