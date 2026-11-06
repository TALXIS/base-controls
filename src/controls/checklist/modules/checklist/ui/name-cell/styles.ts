import { mergeStyleSets } from "@fluentui/react";

export const getChecklistUiNameCellStyles = () => mergeStyleSets({
    completed: {
        textDecoration: 'line-through',
    },
});
