import { mergeStyleSets } from "@fluentui/react";

export const getCardFooterStyles = () => mergeStyleSets({
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        padding: '4px 16px 12px 16px',
    },
});
