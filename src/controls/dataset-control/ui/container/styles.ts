import { mergeStyleSets } from "@fluentui/react";

export const getDatasetControlUiContainerStyles = (height?: string) => mergeStyleSets({
    datasetControlContainer: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: height,
        minHeight: 0,
    },
});
