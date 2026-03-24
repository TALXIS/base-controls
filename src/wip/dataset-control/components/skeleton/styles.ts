import { mergeStyleSets } from "@fluentui/react";

export const getSkeletonStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            padding: '12px 15px',
            flex: 1,
        },
        headerRow: {
            marginBottom: 4,
        },
        row: {
            // default shimmer row styling
        }
    });
}