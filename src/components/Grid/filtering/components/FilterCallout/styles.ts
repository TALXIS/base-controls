import { mergeStyleSets } from "@fluentui/react";

export const filterCalloutStyles = mergeStyleSets({
    root: {
        minHeight: 200,
        padding: 16,
        '.ms-Callout-main': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 180,
            gap: 10
        },
        '.TALXIS__combobox__root, [class*="TALXIS__textfield__root"], [class*="TALXIS__tag-picker__root"]': {
            padding: `0x !important`
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
    valueControlsContainer: {
        flexGrow: 1
    },
    datasetColumnFilteringRoot: {
        flexGrow: 1
    },
    datasetColumnFilteringButtons: {
        justifyContent: 'flex-end',
    }
});