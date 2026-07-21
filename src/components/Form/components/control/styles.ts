import { mergeStyleSets } from "@fluentui/react"

export const getControlStyles = () => {
    return mergeStyleSets({
        controlContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: 5
        }
    });
}