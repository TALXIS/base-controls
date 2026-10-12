import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@theme";

export const getEditColumnsStyles = (theme: ITheme) => {
    return mergeStyleSets({
        panelFooterButtons: {
            display: 'flex',
            gap: 10
        },
        sortableItemsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
        },
        header: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 15
        },
        loadingOverlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
        }
    });
}
