import { mergeStyleSets } from "@fluentui/react"

export const getDatasetControlStyles = (height?: string | null) => {
    return mergeStyleSets({
        datasetControlRoot: {
            display: 'flex',
            flexDirection: 'column',
            ...(height === '100%' ? getFullHeightStyles() : {})

        },
        controlContainer: {
            ...(height === '100%' ? getFullHeightStyles() : {})
        },
        footer: {

        },
    });
}

const getFullHeightStyles = () => {
    return {
        flexGrow: 1
    }
}