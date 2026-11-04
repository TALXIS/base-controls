import { mergeStyleSets } from "@fluentui/react";
import { HIDDEN_LAYER_HOSTS } from "../layout";

export const getFooterStartUiStyles = () => mergeStyleSets({
    datasetControlFooterStart: {
        ...HIDDEN_LAYER_HOSTS,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        flex: '1 1 auto',
        minWidth: 0,
    },
});
