import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@talxis/react-components";

export const getDatasetControlStyles = (theme: ITheme, height?: string | null) => {
    return mergeStyleSets({
        datasetControlRoot: {
            display: 'flex',
            flexDirection: 'column',
            ...(height === '100%' ? getFullHeightStyles(theme) : {})

        },
        headerRoot: {
            display: 'flex',
            paddingLeft: 15,
            paddingTop: 15,
            paddingRight: 15,
            marginBottom: 15
        },
        messageBarBtn: {
            minHeight: 'inherit'
        }
    });
}

const getFullHeightStyles = (theme: ITheme) => {
    return {
        flexGrow: 1
    }
}