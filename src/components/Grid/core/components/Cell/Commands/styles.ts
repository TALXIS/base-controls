import { mergeStyleSets } from "@fluentui/react";

export const commandStyles = mergeStyleSets({
    root: {
        backgroundColor: 'transparent'
    },
    talxisRoot: {
        minWidth: 0,
        flexShrink: 1,
        flexGrow: 1
    },
    button: {
        backgroundColor: 'transparent',
    },
    icon: {
        width: 16,
        height: 16,
        marginLeft: 4,
        marginRight: 4,
    }
});