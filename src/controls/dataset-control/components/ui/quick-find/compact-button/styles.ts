import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getQuickFindCompactButtonStyles = (theme: ITheme) => mergeStyleSets({
    //a query in the field stays visible while the field is folded away
    hasValue: {
        position: 'relative',
        '::after': {
            content: '""',
            position: 'absolute',
            top: 6,
            right: 6,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: theme.palette.themePrimary,
        },
    },
});
