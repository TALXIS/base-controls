import { mergeStyleSets } from "@fluentui/react"

export const getDatasetControlStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            gap: 15
        }
    });
}