import { mergeStyleSets } from "@fluentui/react";

export const getCardBodyStyles = () => mergeStyleSets({
    cardBody: {
        padding: 16,
        flexGrow: 1,
    },
});
