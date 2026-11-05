import { mergeStyleSets } from "@fluentui/react";

export const getDatasetControlRibbonStyles = () => mergeStyleSets({
    //folds its commands down to the overflow button before anything in the header wraps
    datasetControlRibbon: {
        flex: '1 1 44px',
        minWidth: 44,
    },
});
