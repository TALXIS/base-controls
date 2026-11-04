import { mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@core";

export const getColumnHeaderUiPrefixStyles = (alignment: IAlignment) => mergeStyleSets({
    prefix: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        //it stays against what names the column
        order: alignment === 'right' ? 2 : undefined,
    },
});
