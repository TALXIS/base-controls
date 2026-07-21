import { mergeStyleSets } from "@fluentui/react";

export const getTabStyles = () => {
    return mergeStyleSets({
        tab: {
            gap: 12,
            flexGrow: 1,
            minHeight: '0',
            overflow: 'auto'
        }
    });
};
