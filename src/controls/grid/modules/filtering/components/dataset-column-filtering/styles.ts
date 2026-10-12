import { mergeStyleSets } from "@fluentui/react"

export const getDatasetColumnFilteringStyles = () => {
    return mergeStyleSets({
        datasetColumnFilteringRoot: {
            display: 'flex',
            flexDirection: 'column', 
            gap: 10
        },
        valueControlsContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: 5
        },
        buttons: {
            display: 'flex',
            gap: 5
        }
    })
}