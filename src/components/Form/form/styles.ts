import { mergeStyleSets } from "@fluentui/react";

export const getFormStyles = () => {
    return mergeStyleSets({
        form: {
            boxSizing: "border-box",
        }
    });
};