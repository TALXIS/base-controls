import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@talxis/react-components";

export const getEditColumnsStyles = () => {
    return mergeStyleSets({
        sortableItemsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
        },
    });
}