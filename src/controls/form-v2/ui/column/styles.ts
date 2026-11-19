import { mergeStyleSets } from "@fluentui/react";

export const getFormV2UiColumnStyles = () => {
    return mergeStyleSets({
        column: {
            gap: 12,
            display: 'flex',
            flexDirection: 'column'
        }
    });
};
