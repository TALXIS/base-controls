import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getGroupCountStyles = (alignment: IAlignment) => mergeStyleSets({
    count: {
        //the order the control takes, so the count stays beside the value it counts
        order: alignment === 'right' ? 2 : 1,
        paddingLeft: 4,
        marginRight: 8,
        whiteSpace: 'nowrap',
    },
});
