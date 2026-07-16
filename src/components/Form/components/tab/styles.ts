import { mergeStyleSets } from "@fluentui/react";

export const getTabStyles = () => {
    return mergeStyleSets({
        tab: {
            gap: 12
        }
    });
};
