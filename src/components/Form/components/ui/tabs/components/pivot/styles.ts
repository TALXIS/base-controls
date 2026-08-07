import { mergeStyleSets } from "@fluentui/react";

const FLEX_STYLES = {
    display: 'flex',
    flexDirection: 'column' as const,
    flexGrow: 1,
};

export const getPivotItemStyles = () => {
    return mergeStyleSets({
        pivotItem: {
            ...FLEX_STYLES
        }
    });
};
