import { mergeStyleSets } from "@fluentui/react";

export const getLeafletUiStyles = () => {
    return mergeStyleSets({
        map: {
            width: '100%',
            height: '100%',
            flex: 1,
        },
    });
};
