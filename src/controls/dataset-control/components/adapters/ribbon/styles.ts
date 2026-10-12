import { mergeStyleSets } from "@fluentui/react";

export const getDatasetControlRibbonStyles = () => mergeStyleSets({
    //folds its commands down to the overflow button before anything in the header wraps
    datasetControlRibbon: {
        //outweighs Header.Start, which grows too, so a ribbon beside it takes the free space
        flex: '1000 1 44px',
        minWidth: 44,
    },
});
