import { mergeStyleSets } from "@fluentui/react";
import { getMultilineStyles } from "../../styles";

export const getFieldLinkStyles = (isMultiline: boolean, lines: number) => {
    return mergeStyleSets({
        link: {
            minWidth: 0,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            overflow: 'hidden',
            ...isMultiline ? getMultilineStyles(lines) : { whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
        },
    });
};
