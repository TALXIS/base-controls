import { mergeStyleSets } from "@fluentui/react"

export const getTaskGridStyles = () => {
    return mergeStyleSets({
        taskGrid: {
            //an option fills the cell it is in rather than shrinking to its label
            '[class^="optionsRoot"] > *': {
                maxWidth: '100%',
                textAlign: 'center'
            },
        }
    })
}
