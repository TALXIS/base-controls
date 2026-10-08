import { mergeStyleSets } from "@fluentui/react";

export const getNameCellStyles = () => mergeStyleSets({
    completed: {
        textDecoration: 'line-through',
    },
});
