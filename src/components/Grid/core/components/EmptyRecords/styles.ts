import { mergeStyleSets } from "@fluentui/react";

export const emptyRecordStyles = mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'center'
    },
    image: {
        'img': {
            width: '100px'
        }
    }
})