import { mergeStyleSets } from "@fluentui/react";

export const getRowsStyles = () => {
    return mergeStyleSets({
        rows: {
            display: "flex",
            flexDirection: 'column'
        }
    });
};
