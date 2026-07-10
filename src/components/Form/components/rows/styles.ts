import { mergeStyleSets } from "@fluentui/react";

export const getRowsStyles = (cols: number) => {
    return mergeStyleSets({
        root: {
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
            gap: 8,
        },
    });
};
