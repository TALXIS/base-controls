import { mergeStyleSets } from "@fluentui/react";

export const emptyRecordStyles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center',
        position: 'relative',
        top: 18
    },
    icon: {
        fontSize: 46
    },
    image: {
        'img': {
            width: '100px'
        }
    }
})