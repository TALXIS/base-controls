import { mergeStyleSets } from "@fluentui/react";
import { HIDDEN_LAYER_HOSTS } from "../layout";

export const getHeaderItemStyles = () => mergeStyleSets({
    //draws no box of its own, so what it holds lays out as if it were not there
    headerItem: {
        ...HIDDEN_LAYER_HOSTS,
        display: 'contents',
    },
    hidden: {
        display: 'none',
    },
});
