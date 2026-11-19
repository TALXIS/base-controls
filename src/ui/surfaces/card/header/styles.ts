import { mergeStyleSets } from "@fluentui/react";

export const getCardHeaderStyles = () => mergeStyleSets({
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '8px 16px',
        //as tall as a header button, whatever the header holds
        boxSizing: 'content-box',
        minHeight: 32,
    },
});
