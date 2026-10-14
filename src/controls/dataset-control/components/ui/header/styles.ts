import { mergeStyleSets } from "@fluentui/react";
import { HEADER_CONTAINER, HEADER_PART_HEIGHT } from "../layout";

export const getHeaderUiStyles = () => mergeStyleSets({
    datasetControlHeader: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        //the lines Header.End's parts wrap onto stay on the right
        justifyContent: 'flex-end',
        gap: 8,
        marginBottom: 15,
        minHeight: HEADER_PART_HEIGHT,
        //only the body gives way when the records need more height than the container has
        flexShrink: 0,
        containerType: 'inline-size',
        containerName: HEADER_CONTAINER,
    },
});
