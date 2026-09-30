import { mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderUiSuffixStyles = () => mergeStyleSets({
    suffixContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
    },
});
