import { mergeStyleSets } from "@fluentui/react";

export const getTabStyles = () => {
    return mergeStyleSets({
        tab: {
            gap: 12,
            flexGrow: 1,
            height: '0',
            overflow: 'auto'
        }
    });
};
