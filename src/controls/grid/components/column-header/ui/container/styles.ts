import { mergeStyleSets } from "@fluentui/react";

export const getColumnHeaderContainerStyles = () => mergeStyleSets({
    containerRoot: {
        width: '100%',
        height: 42,
        paddingLeft: 10,
        paddingRight: 10,
        overflow: 'hidden',
    },
    containerFlexContainer: {
        gap: 5,
    },
});
