import { mergeStyleSets } from "@fluentui/react";

export const getNotificationCalloutHostStyles = () => mergeStyleSets({
    callout: {
        '.ms-Callout-main': {
            padding: 16,
        },
    },
});
