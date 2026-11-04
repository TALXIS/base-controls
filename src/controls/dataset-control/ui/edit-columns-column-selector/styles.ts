import { mergeStyleSets } from "@fluentui/react";

export const getEditColumnsColumnSelectorUiStyles = () => mergeStyleSets({
    editColumnsColumnSelector: {
        //the chosen values are not drawn, so the input takes the whole control
        '>div>div>div': {
            gridTemplateColumns: 'min-content',
        },
    },
});
