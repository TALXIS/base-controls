import { mergeStyleSets } from "@fluentui/react";

export const getColumnStyles = () => {
    return mergeStyleSets({
        column: {
            gap: 12,
            display: 'flex',
            flexDirection: 'column'
        }
    });
};
