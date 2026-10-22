import { mergeStyleSets } from "@fluentui/react";

export const getPersonLookupManyOptionStyles = () => mergeStyleSets({
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
});
