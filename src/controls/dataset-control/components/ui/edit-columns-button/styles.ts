import { mergeStyleSets } from "@fluentui/react";

export const getEditColumnsButtonUiStyles = () => mergeStyleSets({
    //keeps its label whole; the ribbon and the quick find give way first
    editColumnsButton: {
        flexShrink: 0,
        height: 44,
    },
});
