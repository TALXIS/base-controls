import { mergeStyleSets } from "@fluentui/react";

export const getTooltipUiFieldRowsStyles = () => mergeStyleSets({
    fieldRows: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 12,
    },
});
