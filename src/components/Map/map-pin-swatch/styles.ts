import { mergeStyleSets } from '@fluentui/react';

export const getMapPinSwatchStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'inline-block',
            flexShrink: 0,
            verticalAlign: 'middle'
        }
    });
};
