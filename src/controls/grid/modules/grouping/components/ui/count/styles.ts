import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getGroupingUiCountStyles = (alignment: IAlignment) => mergeStyleSets({
    count: {
        //ordered so the count stays beside the value it counts
        order: alignment === 'right' ? 2 : 1,
        paddingLeft: 4,
        marginRight: 8,
        whiteSpace: 'nowrap',
    },
});
