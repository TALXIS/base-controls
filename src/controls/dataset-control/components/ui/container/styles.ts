import { mergeStyleSets } from "@fluentui/react";

export const getContainerUiStyles = (height?: string) => mergeStyleSets({
    datasetControlContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: height,
        minHeight: 0,
    },
});
