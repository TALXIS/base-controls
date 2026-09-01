import { mergeStyleSets } from "@fluentui/react";

export const getMarkerStyles = () => {
    return mergeStyleSets({
        overlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 5,
            overflow: 'visible',
        },
        chip: {
            position: 'absolute',
            bottom: 0,
        }
    });
}