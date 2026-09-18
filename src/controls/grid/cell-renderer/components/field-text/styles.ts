import { mergeStyleSets } from "@fluentui/react";
import { getMultilineStyles } from "../../styles";

export const getFieldTextStyles = (isMultiline: boolean, isPlaceholder: boolean) => {
    return mergeStyleSets({
        text: {
            minWidth: 0,
            //inherited: the cell sets the size, and a value is not the place to disagree with it
            fontSize: 'inherit',
            fontWeight: 'inherit',
            overflow: 'hidden',
            //a placeholder stands in for a value rather than being one
            opacity: isPlaceholder ? 0.6 : undefined,
            //wraps at the spaces first and ellipsises what still will not fit: a single word wider than the
            //cell has nowhere to break, and reads better cut short than running past the edge
            ...isMultiline ? getMultilineStyles() : { whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
        },
    });
};
