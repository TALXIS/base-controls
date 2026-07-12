import { mergeStyleSets } from "@fluentui/react";

export const getSectionsStyles = () => {
    return mergeStyleSets({
        sections: {
            display: "flex",
            flexDirection: "column"
        },
    });
};
