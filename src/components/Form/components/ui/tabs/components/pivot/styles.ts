import { ITheme, mergeStyleSets } from "@fluentui/react";

const FLEX_STYLES = {
    display: 'flex',
    flexDirection: 'column' as const,
    flexGrow: 1,
};

export const getPivotStyles = (theme: ITheme) => {
    return mergeStyleSets({
        pivot: {
            //boxShadow: theme.effects.elevation4,
            //height: 44,
            //zIndex: 1
        },
        pivotContainer: {
            ...FLEX_STYLES,
        },
        itemContainer: {
            ...FLEX_STYLES
        },
        pivotItem: {
            ...FLEX_STYLES
        }
    });
};
