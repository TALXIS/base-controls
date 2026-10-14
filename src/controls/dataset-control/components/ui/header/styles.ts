import { mergeStyleSets } from "@fluentui/react";
import { HEADER_PART_HEIGHT } from "../layout";
import { getHeaderItemStyles } from "../header-item/styles";

const { headerItem } = getHeaderItemStyles();

export const getHeaderUiStyles = (isolatedClassName?: string) => mergeStyleSets({
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
        //every item that does not hold the isolated element; :has() only runs on the items
        ...(isolatedClassName && {
            [`& .${headerItem}:not(:has(.${isolatedClassName}))`]: {
                display: 'none',
            },
        }),
    },
});
