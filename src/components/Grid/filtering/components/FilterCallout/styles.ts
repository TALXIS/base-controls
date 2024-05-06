import { mergeStyleSets } from "@fluentui/react";

export const filterCalloutStyles = mergeStyleSets({
    controls: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        flexGrow: 1
    },
    root: {
        minHeight: 200,
        padding: 16,
        '.ms-Callout-main': {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
        }
    },
    title: {
        fontWeight: 600,
        flexGrow: 1
    },
    header: {
        display: 'flex',
        'i': {
            fontSize: 12
        }
    },
    footer: {
        display: 'flex',
        gap: 10,
        justifyContent: 'flex-end'
    }
});