import { mergeStyleSets } from "@fluentui/react";

export const getFilterCalloutStyles = () => mergeStyleSets({
    valueControlsContainer: {
        flexGrow: 1,
    },
    datasetColumnFilteringRoot: {
        flexGrow: 1,
    },
    datasetColumnFilteringButtons: {
        justifyContent: 'flex-end',
    },
});
