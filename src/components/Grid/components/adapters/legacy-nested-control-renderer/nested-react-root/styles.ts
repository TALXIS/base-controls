import { mergeStyleSets } from "@fluentui/react";

export const getNestedReactRootStyles = () => mergeStyleSets({
    nestedReactRootContainer: {
        flex: 1,
        minWidth: 0,
        height: '100%',
    },
});
