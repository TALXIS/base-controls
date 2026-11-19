import { mergeStyleSets } from "@fluentui/react";

export const getCardHeaderEndStyles = () => mergeStyleSets({
    cardHeaderEnd: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
        marginLeft: 'auto',
    },
});
