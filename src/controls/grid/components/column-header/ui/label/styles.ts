import { mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderUiLabelStyles = () => mergeStyleSets({
    label: {
        fontWeight: 600,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
});
