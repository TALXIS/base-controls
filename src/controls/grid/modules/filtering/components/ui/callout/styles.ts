import { mergeStyleSets } from "@fluentui/react";

export const getFilteringUiCalloutStyles = () => mergeStyleSets({
    root: {
        minHeight: 200,
        padding: 16,
        '.ms-Callout-main': {
            display: 'flex',
            flexDirection: 'column',
            minHeight: 180,
            gap: 10,
        },
        //the value controls bring an inset the callout already has
        '.TALXIS__combobox__root, [class*="TALXIS__textfield__root"], [class*="TALXIS__tag-picker__root"]': {
            padding: '0px !important',
        },
    },
    header: {
        display: 'flex',
        'i': {
            fontSize: 12,
        },
    },
    title: {
        fontWeight: 600,
        flexGrow: 1,
    },
});
