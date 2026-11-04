import { mergeStyleSets } from "@fluentui/react";

export const getEmptyStateOverlayStyles = () => mergeStyleSets({
    emptyStateOverlay: {
        position: 'relative',
        top: 18,
    },
});
