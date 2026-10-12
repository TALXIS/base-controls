import { mergeStyleSets } from "@fluentui/react";

export const getLookupManyControlStyles = () => mergeStyleSets({
    root: {
        alignSelf: 'center',
        minWidth: 0,
        overflow: 'hidden',
        paddingLeft: 9,
        paddingRight: 9,
    },
});
