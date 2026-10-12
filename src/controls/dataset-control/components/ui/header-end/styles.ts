import { mergeStyleSets } from "@fluentui/react";
import { HIDDEN_LAYER_HOSTS } from "../layout";

export const getHeaderEndUiStyles = () => mergeStyleSets({
    //its parts share the header's lines, so they fold and wrap one by one beside Header.Start
    datasetControlHeaderEnd: {
        ...HIDDEN_LAYER_HOSTS,
        display: 'contents',
    },
});
