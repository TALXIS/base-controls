import { mergeStyleSets } from "@fluentui/react";

export const getLoadingBoundaryStyles = () => mergeStyleSets({
    loadingBoundary: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
});
