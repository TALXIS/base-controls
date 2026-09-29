import { mergeStyleSets } from "@fluentui/react";

export const getRowUiErrorStyles = () => mergeStyleSets({
    messageBarRoot: {
        height: '100%',
        justifyContent: 'center',
    },
});
