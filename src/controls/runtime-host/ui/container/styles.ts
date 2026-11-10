import { mergeStyleSets } from "@fluentui/react";

export const getRuntimeHostUiContainerStyles = () => mergeStyleSets({
    //what the loading overlay covers
    runtime: {
        position: 'relative',
    },
});
