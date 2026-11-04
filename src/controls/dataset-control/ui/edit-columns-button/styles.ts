import { mergeStyleSets } from "@fluentui/react";
import { HEADER_PART_HEIGHT } from "../layout";

export const getEditColumnsButtonUiStyles = () => mergeStyleSets({
    //keeps its label whole; the ribbon and the quick find give way first
    tooltipHost: {
        display: 'inline-flex',
        flexShrink: 0,
    },
    editColumnsButton: {
        height: HEADER_PART_HEIGHT,
    },
});
