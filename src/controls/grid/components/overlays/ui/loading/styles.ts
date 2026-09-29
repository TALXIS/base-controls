import { mergeStyleSets } from "@fluentui/react";

export const getOverlayUiLoadingStyles = () => mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    message: {
        fontWeight: 600,
    },
});
