import { mergeStyleSets } from "@fluentui/react";
import { HIDDEN_LAYER_HOSTS } from "../layout";

export const getFooterEndUiStyles = () => mergeStyleSets({
    datasetControlFooterEnd: {
        ...HIDDEN_LAYER_HOSTS,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 8,
        minHeight: 44,
        flex: '1 1 auto',
        minWidth: 0,
    },
});
