import { mergeStyleSets } from "@fluentui/react"

export const getSelectionHeaderStyles = () => {
    return mergeStyleSets({
        container: {
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            height: '100%',
            alignItems: 'center'
        },
        checkbox: {
            marginRight: 0.5
        }
    });
}
