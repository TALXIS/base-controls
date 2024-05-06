import { mergeStyleSets } from "@fluentui/react";

export const optionSetStyles = mergeStyleSets({
    root: {
        display: 'flex',
        gap: 5,
        overflow: 'hidden',
        '--light': 80,
        '--threshold': 60,
        flexGrow: 1
    },
    option: {
        borderRadius: 5,
        paddingLeft: 4,
        paddingRight: 4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flexGrow: 1,
        textAlign: 'center',
        '>span': {
            color: 'inherit',
        }
    }
})