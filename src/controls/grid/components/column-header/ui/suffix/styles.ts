import { mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderSuffixStyles = () => mergeStyleSets({
    suffixContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
    },
});
