import { mergeStyleSets } from "@fluentui/react";
import { compactQuery, HEADER_CONTAINER } from "../layout";

export const getQuickFindUiStyles = () => mergeStyleSets({
    //shrinks a little, then wraps onto the next line
    datasetControlQuickFind: {
        flex: '0 1 230px',
        minWidth: 160,
        [compactQuery(HEADER_CONTAINER)]: {
            flex: '1 1 100%',
        },
    },
});
