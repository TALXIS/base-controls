import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getTimelineTaskCreateLineStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            position: 'absolute',
            height: 26,
            transform: 'translateY(-50%)',
            backgroundColor: 'rgb(155, 203, 150)',
            borderRadius: 4,
            pointerEvents: 'none',
            zIndex: 3,
        },
    });
};
