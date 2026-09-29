import { mergeStyleSets } from "@fluentui/react";
import { getJustifyContent, IAlignment } from "@utils";

export const getColumnHeaderContentStyles = (alignment: IAlignment) => mergeStyleSets({
    content: {
        display: 'flex',
        flex: 1,
        gap: 5,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: getJustifyContent(alignment),
        //a right-aligned column reads outwards from its edge
        order: alignment === 'right' ? 2 : undefined,
    },
});
