import { mergeStyleSets } from "@fluentui/react";

export const getLockIconStyles = () => mergeStyleSets({
    //the control lays its content out as a grid
    icon: {
        justifySelf: 'center',
    },
});
