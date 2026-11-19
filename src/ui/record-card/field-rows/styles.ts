import { mergeStyleSets } from "@fluentui/react";

export const getRecordCardFieldRowsStyles = () => mergeStyleSets({
    fieldRows: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        ':not(:last-child)': {
            marginBottom: 12,
        },
    },
});
