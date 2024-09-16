import { mergeStyleSets } from "@fluentui/react/lib/Styling";
import { ITheme } from "../../interfaces/theme";
export const getOptionSetComponentStyles = (theme: ITheme) => {
    return mergeStyleSets({
        cicrleIconStyle: {
            marginRight: '8px',
            fontSize: '12px'
        },
    })
}