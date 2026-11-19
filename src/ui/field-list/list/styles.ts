import { mergeStyleSets } from "@fluentui/react";

export const getFieldListStyles = () => mergeStyleSets({
    fieldList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flex: '1 1 auto',
        minWidth: 0,
    },
});
