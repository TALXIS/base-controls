import { mergeStyleSets } from "@fluentui/react";

export const getManageViewsStyles = () => mergeStyleSets({
    //fills the dialog's body and shrinks with it
    datasetControl: {
        flex: 1,
        minHeight: 240,
    },
    header: {
        padding: 15,
    },
});
