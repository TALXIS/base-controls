import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getMultiValueRemoveStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 2,
            padding: 1,
            cursor: 'pointer',
            borderRadius: 2,
            color: theme.palette.neutralSecondary,
            height: 20,
            width: 20,
            ':hover': {
                color: theme.palette.neutralPrimary,
                backgroundColor: theme.palette.neutralLight,
            },
        },
        icon: {
            fontSize: 10,
        },
    });
};
