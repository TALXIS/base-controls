import { mergeStyleSets } from "@fluentui/react";

export const getErrorMessageBarStyles = () => mergeStyleSets({
    content: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 600,
    },
    actions: {
        margin: 0,
    },
    commandBar: {
        padding: 0,
        //the height of a single-line message bar
        height: 32,
    },
});
