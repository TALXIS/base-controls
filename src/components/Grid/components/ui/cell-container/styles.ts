import { mergeStyleSets } from "@fluentui/react";

export const getCellContainerStyles = () => mergeStyleSets({
    //the container sits between `.ag-cell` and the cell's content, and both size themselves against it
    cellContainer: {
        width: '100%',
        height: '100%',
        display: 'flex'
    },
});
