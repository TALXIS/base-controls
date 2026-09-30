import { mergeStyleSets } from "@fluentui/react";

export const getGroupingUiExpandCollapseStyles = () => mergeStyleSets({
    root: {
        display: 'flex',
        justifyContent: 'center',
        gap: 5,
        width: '100%'
    },
    button: {
        minWidth: 0,
        minHeight: 0,
        width: 20,
        height: 20,
        padding: 0,
    },
    icon: {
        fontSize: 12,
    },
});
