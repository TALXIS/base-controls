import { mergeStyleSets } from "@fluentui/react";

export const getFieldFileStyles = () => mergeStyleSets({
    fileRoot: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        minWidth: 0,
        overflow: 'hidden',
    },
    icon: {
        //never squashed by a long name, and never grown by a short one
        flex: '0 0 auto',
        fontSize: 16,
    },
    thumbnail: {
        flex: '0 0 auto',
        //as tall as a row allows and no taller: a cell is not the place for a full-size image
        maxHeight: 20,
        maxWidth: 32,
        objectFit: 'contain',
    },
    name: {
        minWidth: 0,
        fontSize: 'inherit',
        fontWeight: 'inherit',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
});
