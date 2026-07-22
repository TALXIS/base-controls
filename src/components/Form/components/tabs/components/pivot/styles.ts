import { ITheme, mergeStyleSets } from "@fluentui/react"
import { FLEX_STYLES } from "../../../form/styles"

export const getPivotStyles = (theme: ITheme) => {
    return mergeStyleSets({
        pivot: {
            boxShadow: theme.effects.elevation4,
            height: 44,
            zIndex: 1
        },
        pivotContainer: {
            ...FLEX_STYLES,
        },
        itemContainer: {
            ...FLEX_STYLES
        },
        pivotItem: {
            ...FLEX_STYLES
        }
    })
}