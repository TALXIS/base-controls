import { mergeStyleSets } from "@fluentui/react";

export const getDatasetControlUiBodyStyles = () => mergeStyleSets({
    datasetControlBody: {
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
    },
});
