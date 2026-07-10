import { mergeStyleSets } from '@fluentui/react';

export const getOptionStyles = (color: string) => {
    return mergeStyleSets({
        container: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        },
        dot: {
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: color,
            flexShrink: 0,
        },
    });
};
