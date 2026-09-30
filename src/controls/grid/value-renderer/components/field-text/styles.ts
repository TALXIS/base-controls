import { mergeStyleSets } from "@fluentui/react";
import { getMultilineStyles } from "../../styles";

export const getFieldTextStyles = (isMultiline: boolean, isPlaceholder: boolean, lines: number) => {
    return mergeStyleSets({
        text: {
            minWidth: 0,
            //inherited: the cell sets the size
            fontSize: 'inherit',
            fontWeight: 'inherit',
            overflow: 'hidden',
            opacity: isPlaceholder ? 0.6 : undefined,
            //wraps at spaces first and ellipsises a word too wide to break
            ...isMultiline ? getMultilineStyles(lines) : { whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
        },
    });
};
