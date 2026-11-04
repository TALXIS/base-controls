import { mergeStyleSets } from "@fluentui/react";
import { HEADER_PART_HEIGHT } from "../../ui/layout";

export const getDatasetControlRibbonStyles = () => mergeStyleSets({
    //folds its commands down to the overflow button before anything in the header wraps
    datasetControlRibbon: {
        flex: '1 1 44px',
        minWidth: 44,
        '& .ms-CommandBar': {
            height: HEADER_PART_HEIGHT,
        },
    },
});
