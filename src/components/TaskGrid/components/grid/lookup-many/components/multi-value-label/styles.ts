import { mergeStyleSets } from '@fluentui/react';

export const getMultiValueLabelStyles = () => {
    return mergeStyleSets({
        root: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 600
        },
        link: {
            fontWeight: 600,
            pointerEvents: 'all',
        }
    });
};
