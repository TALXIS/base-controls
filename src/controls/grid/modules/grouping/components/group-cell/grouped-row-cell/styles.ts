import { mergeStyleSets } from "@fluentui/react";

export const getGroupedRowCellStyles = () => mergeStyleSets({
    commands: {
        //ahead of the value whatever order the column's alignment gives the two
        order: '0 !important',
        //only the room the buttons need, so the value keeps the rest
        flex: '0 0 auto !important',
    },
});
