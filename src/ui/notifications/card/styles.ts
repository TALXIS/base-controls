import { mergeStyleSets } from "@fluentui/react";

export const getNotificationCardStyles = () => mergeStyleSets({
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    title: {
        fontWeight: 600,
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    links: {
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: 12,
        rowGap: 4,
        marginTop: 8,
    },
    link: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
    },
});
