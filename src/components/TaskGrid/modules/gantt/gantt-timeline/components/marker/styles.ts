import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getMarkerStyles = (theme: ITheme, color: string) => {
    return mergeStyleSets({
        root: {
            padding: '4px 10px',
            fontSize: 12,
            lineHeight: '14px',
            fontWeight: 600,
            color: `contrast-color(${color})`,
            backgroundColor: color,
            boxShadow: theme.effects.elevation8,
        }
    });
};
