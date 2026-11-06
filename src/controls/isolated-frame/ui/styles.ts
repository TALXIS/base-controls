import { mergeStyleSets } from "@fluentui/react";

export const getIsolatedFrameUiFrameStyles = () => mergeStyleSets({
    frame: {
        display: 'block',
        width: '100%',
        height: '100%',
        border: 0,
    },
});
