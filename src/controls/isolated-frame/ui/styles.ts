import { mergeStyleSets } from "@fluentui/react";

export const getIsolatedFrameUiFrameStyles = (height?: string) => mergeStyleSets({
    frame: {
        display: 'block',
        width: '100%',
        height,
        border: 0,
    },
});
