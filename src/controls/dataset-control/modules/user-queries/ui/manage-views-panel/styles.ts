import { mergeStyleSets } from "@fluentui/react";

export const getManageViewsPanelUiStyles = () => mergeStyleSets({
    //the views' grid runs to the panel's edges
    content: {
        selectors: {
            '> div': {
                padding: 0,
            },
        },
    },
});
