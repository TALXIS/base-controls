import { mergeStyleSets } from "@fluentui/react";

export const getRuntimeHostUiContainerStyles = () => mergeStyleSets({
    container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: 0,
        minWidth: 0,
    },
});
