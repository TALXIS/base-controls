import { mergeStyleSets } from "@fluentui/react";

export const getLookupManyFilterStyles = () => mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        gap: 10,
    },
    value: {
        flexGrow: 1,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 5,
    },
});
