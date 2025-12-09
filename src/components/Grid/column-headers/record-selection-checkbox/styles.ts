import { mergeStyleSets } from "@fluentui/react"

export const getGlobalCheckboxStyles = () => {
    return mergeStyleSets({
        root: {
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