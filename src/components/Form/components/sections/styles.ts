import { mergeStyleSets } from "@fluentui/react";

export const getSectionsStyles = () => {
    return mergeStyleSets({
        root: {
            display: "flex",
            flexDirection: "column",
            gap: 16,
        },
    });
};
