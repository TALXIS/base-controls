import { mergeStyleSets } from "@fluentui/react";

export const getDatasetControlUiHeaderStartStyles = () => mergeStyleSets({
    //its parts share the header's lines, so each sizes itself beside Header.End's
    datasetControlHeaderStart: {
        display: 'contents',
    },
});
