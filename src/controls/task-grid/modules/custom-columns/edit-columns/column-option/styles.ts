import { mergeStyleSets } from "@fluentui/react";

export const getColumnOptionStyles = () => mergeStyleSets({
    columnOption: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        flex: '1 1 auto',
        minWidth: 0,
    },
    button: {
        width: 24,
        height: 24,
    },
});
