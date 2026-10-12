import { mergeStyleSets } from "@fluentui/react";

export const getBodyUiStyles = () => mergeStyleSets({
    datasetControlBody: {
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
    },
});
