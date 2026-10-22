import { mergeStyleSets } from "@fluentui/react";

export const getAddTaskButtonStyles = () => mergeStyleSets({
    //only on the row the user is on
    addTaskButton: {
        width: '100%',
        height: '100%',
        visibility: 'hidden',
        selectors: {
            ':global(.ag-row-hover) &, :global(.ag-row-focus) &, :global(.ag-row-selected) &, &:focus': {
                visibility: 'visible',
            },
        },
    },
});
