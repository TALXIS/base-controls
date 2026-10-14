import { mergeStyleSets } from "@fluentui/react";
import { HEADER_PART_HEIGHT, HIDDEN_LAYER_HOSTS } from "../layout";

export const getHeaderStartUiStyles = () => mergeStyleSets({
    //grows, so a ribbon inside it has room; a command bar has no content width to size it by
    datasetControlHeaderStart: {
        ...HIDDEN_LAYER_HOSTS,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        minHeight: HEADER_PART_HEIGHT,
        flex: '1 1 auto',
        minWidth: 0,
    },
});
