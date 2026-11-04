import { mergeStyleSets } from "@fluentui/react";

export const getNameCellUiStyles = () => mergeStyleSets({
    completed: {
        textDecoration: 'line-through',
    },
});
