import { mergeStyleSets } from "@fluentui/react";
import { FILLED_HEADER_INSET, HEADER_PART_HEIGHT } from "../layout";

export const getHeaderUiStyles = (isPadded: boolean) => mergeStyleSets({
    datasetControlHeader: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        marginBottom: 15,
        minHeight: HEADER_PART_HEIGHT,
        padding: isPadded ? `${FILLED_HEADER_INSET}px ${FILLED_HEADER_INSET}px 0` : undefined,
        //only the body gives way when the records need more height than the container has
        flexShrink: 0,
    },
});
