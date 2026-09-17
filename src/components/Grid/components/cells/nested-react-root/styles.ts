import { mergeStyleSets } from "@fluentui/react";

export const getNestedReactRootStyles = () => mergeStyleSets({
    //the inset gives this its size, so this only lays out what is mounted in it
    nestedReactRootContainer: {
        display: 'flex',
    },
});
