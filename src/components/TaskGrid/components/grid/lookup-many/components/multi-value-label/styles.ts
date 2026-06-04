import { mergeStyleSets } from '@fluentui/react';

export const getMultiValueLabelStyles = () => {
    return mergeStyleSets({
        root: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'block',
        },
        link: {
            pointerEvents: 'all',
            overflow: 'hidden',
            display: 'block',
        }
    });
};
