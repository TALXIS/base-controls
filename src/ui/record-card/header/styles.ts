import { mergeStyleSets } from "@fluentui/react";

export const getRecordCardHeaderStyles = () => mergeStyleSets({
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 12,
    },
});
