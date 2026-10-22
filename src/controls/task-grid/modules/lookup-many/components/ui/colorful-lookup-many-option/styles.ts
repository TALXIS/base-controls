import { mergeStyleSets } from "@fluentui/react";

export const getColorfulLookupManyOptionStyles = (color: string) => mergeStyleSets({
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 12,
        height: 12,
        flexShrink: 0,
        borderRadius: '50%',
        backgroundColor: color,
    },
});
