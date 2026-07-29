import { mergeStyleSets } from "@fluentui/react";

export const getTabStyles = () => {
    return mergeStyleSets({
        tab: {
            gap: 12,
            flexGrow: 1,
            overflow: 'auto',
            gridAutoRows: 'min-content',
            paddingTop: 12
        }
    });
};
