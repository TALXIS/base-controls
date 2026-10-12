import { mergeStyleSets } from "@fluentui/react";

export const getEditColumnsSelectorUiStyles = () => mergeStyleSets({
    option: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
    },
    optionText: {
        flexGrow: 1,
    },
});
