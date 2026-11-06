import { mergeStyleSets } from "@fluentui/react";

export const getLookupManyUiPersonOptionStyles = () => mergeStyleSets({
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    persona: {
        margin: 0,
    },
});
