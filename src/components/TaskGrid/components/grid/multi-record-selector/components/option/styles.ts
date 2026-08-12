import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getOptionStyles = (theme: ITheme, isFocused: boolean, isSelected: boolean) => {
    return mergeStyleSets({
        root: {
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: 14,
            color: theme.semanticColors.bodyText,
            backgroundColor: isSelected
                ? theme.palette.themeLighter
                : isFocused
                    ? theme.semanticColors.menuItemBackgroundHovered
                    : theme.semanticColors.menuBackground,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ':active': {
                backgroundColor: theme.semanticColors.menuItemBackgroundPressed,
            },
        },
    });
};
