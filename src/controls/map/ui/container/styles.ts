import { mergeStyleSets } from "@fluentui/react";

const MIN_HEIGHT = 200;

export const getMapUiContainerStyles = (height?: string) => {
    return mergeStyleSets({
        container: {
            //the loading overlay covers the nearest positioned element
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            minWidth: 0,
            //fills a flex parent's free space or a sized parent's height
            ...(height ? { height } : { flex: '1 1 auto', height: '100%', minHeight: MIN_HEIGHT }),
        },
    });
};
