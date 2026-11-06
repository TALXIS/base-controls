import { mergeStyleSets } from "@fluentui/react";

export const getRecordCardStyles = () => mergeStyleSets({
    card: {
        width: 280,
        boxSizing: 'border-box',
        padding: '14px 16px 12px',
    },
});
