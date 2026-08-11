import { mergeStyleSets } from "@fluentui/react";

export const getGoogleMapsProviderStyles = () => {
    return mergeStyleSets({
        container: {
            width: '100%',
            height: '100%',
            minHeight: 200,
            flex: 1,
        }
    });
};
