import { mergeStyleSets } from "@fluentui/react";

export const getEditColumnsStyles = () => {
    return mergeStyleSets({
        removeCustomColumnBtn: {
            height: 24
        },
        layerHost: {
            zIndex: 1
        },
    })
};