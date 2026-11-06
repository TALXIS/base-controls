import { mergeStyleSets } from "@fluentui/react";

export const getRecordCardHeaderEndStyles = () => mergeStyleSets({
    container: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
        alignSelf: 'flex-start',
        marginTop: 1,
    },
});
