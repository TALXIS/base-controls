import { mergeStyleSets } from "@fluentui/react";

export const getHeaderStyles = () => {
    return mergeStyleSets({
        ribbonQuickFindContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: 8
        },
        ribbon: {
            flex: 1
        },
        header: {
            paddingLeft: 15,
            paddingTop: 15,
            paddingRight: 15,
            marginBottom: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: 8
        },
        unsavedChangesMessageBarBtn: {
            height: 32
        }
    });
}