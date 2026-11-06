import { mergeStyleSets } from "@fluentui/react";

export const getFormUiColumnStyles = () => {
    return mergeStyleSets({
        column: {
            gap: 12,
            display: 'flex',
            flexDirection: 'column'
        }
    });
};
