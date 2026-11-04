import { mergeStyleSets } from "@fluentui/react";

export const getEditColumnsPanelUiStyles = () => mergeStyleSets({
    content: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    footer: {
        display: 'flex',
        gap: 10,
    },
});
