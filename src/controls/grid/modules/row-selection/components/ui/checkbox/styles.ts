import { mergeStyleSets } from "@fluentui/react";

export const getRowSelectionUiCheckboxStyles = () => mergeStyleSets({
    container: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    checkbox: {
        marginRight: 0.5,
    },
});
