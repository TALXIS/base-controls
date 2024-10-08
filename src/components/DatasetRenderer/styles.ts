import { mergeStyleSets } from "@fluentui/react"

export const getDatasetRendererStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            gap: 15
        },
        quickFind: {
            //alignSelf: 'flex-end'
        }
    });
}