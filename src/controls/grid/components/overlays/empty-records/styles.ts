import { mergeStyleSets } from "@fluentui/react";

export const getEmptyRecordsOverlayStyles = () => mergeStyleSets({
    emptyRecordsOverlay: {
        position: 'relative',
        top: 18,
    },
});
