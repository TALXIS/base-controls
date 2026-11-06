import { mergeStyleSets } from "@fluentui/react";

export const getGoogleMapsUiStyles = () => {
    return mergeStyleSets({
        map: {
            width: '100%',
            height: '100%',
            flex: 1,
        },
    });
};
