import { mergeStyleSets } from "@fluentui/react";

export const getCardFooterEndStyles = () => mergeStyleSets({
    cardFooterEnd: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        marginLeft: 'auto',
    },
});
