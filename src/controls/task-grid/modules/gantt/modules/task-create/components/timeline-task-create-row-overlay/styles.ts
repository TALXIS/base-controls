import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getTimelineTaskCreateRowOverlayStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            cursor: 'copy'
        },
    });
};
