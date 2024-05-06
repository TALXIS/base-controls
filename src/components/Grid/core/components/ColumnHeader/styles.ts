import { mergeStyleSets } from "@fluentui/react";

export const columnHeaderStyles = mergeStyleSets(({
    root: {
        width: '100%',
        textAlign: 'left',
        height: 42,
        paddingLeft: 10,
        paddingRight: 10,
        '.ms-Button-flexContainer': {
            justifyContent: 'flex-start',
            gap: 2
        }
    },
    label: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        cursor: 'pointer',
        flexGrow: 1
    },
    filterSortIcons: {
        display: 'flex',
        gap: 2
    },
    editIcon: {
        marginRight: 3
    }
}));