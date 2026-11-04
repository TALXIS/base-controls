import { mergeStyleSets } from "@fluentui/react";

export const getQuickFindCalloutStyles = () => mergeStyleSets({
    calloutMain: {
        padding: 8,
    },
    bold: {
        fontWeight: 600,
    },
    columns: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 4,
    },
    warningIcon: {
        position: 'relative',
        top: 1,
        marginRight: 4,
    },
});
