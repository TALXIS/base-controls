import { mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderLabelStyles = () => mergeStyleSets({
    label: {
        fontWeight: 600,
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
});
