import { mergeStyleSets } from "@fluentui/react"
import { getJustifyContent } from "../../styles"
import { IColumn } from "@talxis/client-libraries"

export const getColorfulOptionSetValuesRendererStyles = (columnAlignment: IColumn['alignment']) => {
    return mergeStyleSets({
        colorfulOptionSetValueRendererRoot: {
            display: 'flex',
            gap: 5,
            width: '100%',
            justifyContent: getJustifyContent(columnAlignment)
        }
    })
}

export const getColorfulOptionValueRendererStyles = () => {
    return mergeStyleSets({
        colorfulOptionValueRendererRoot: {
            borderRadius: 5,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
            maxWidth: 'fit-content'
        }
    })
}