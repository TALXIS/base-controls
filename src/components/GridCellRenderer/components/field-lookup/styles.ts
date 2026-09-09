import { mergeStyleSets } from "@fluentui/react";

export const getFieldLookupStyles = () => mergeStyleSets({
    lookupRoot: {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 5,
        minWidth: 0,
        overflow: 'hidden',
    },
});
