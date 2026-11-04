import { mergeStyleSets } from "@fluentui/react";

export const getNestedReactRootStyles = () => mergeStyleSets({
    //a column, like the inset it sits in: what is mounted here stretches to the width it is given
    nestedReactRootContainer: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
    },
});
