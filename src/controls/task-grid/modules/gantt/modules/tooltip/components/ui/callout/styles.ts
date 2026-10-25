import { mergeStyleSets } from "@fluentui/react";

export const getTaskTooltipUiCalloutStyles = () => mergeStyleSets({
    container: {
        padding: '12px 16px',
        minWidth: 240,
        maxWidth: 320,
        pointerEvents: 'none',
    },
});
