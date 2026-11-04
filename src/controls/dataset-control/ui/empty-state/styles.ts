import { mergeStyleSets } from "@fluentui/react";

export const getEmptyStateUiStyles = () => mergeStyleSets({
    datasetControlEmptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 46,
    },
});
