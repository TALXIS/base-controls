import { mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiFieldRowsStyles = () => mergeStyleSets({
    fieldRows: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
    },
});
