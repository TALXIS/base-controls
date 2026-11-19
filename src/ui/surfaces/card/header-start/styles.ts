import { mergeStyleSets } from "@fluentui/react";

export const getCardHeaderStartStyles = () => mergeStyleSets({
    cardHeaderStart: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: '1 1 auto',
        minWidth: 0,
    },
});
