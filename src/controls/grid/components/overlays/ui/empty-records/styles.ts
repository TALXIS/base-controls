import { mergeStyleSets } from "@fluentui/react";

export const getEmptyRecordsStyles = () => mergeStyleSets({
    emptyRecordsRoot: {
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
})