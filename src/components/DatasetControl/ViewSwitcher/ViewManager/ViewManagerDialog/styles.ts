import { mergeStyleSets } from "@fluentui/react"

export const getViewManagerDialogStyles = () => {
    return mergeStyleSets({
        dialogContent: {
            '.ms-Dialog-content': {
                display: 'flex',
                flexGrow: 1,
                '>div': {
                    flexGrow: 1
                }
            }
        },
        datasetControlRoot: {
            width: 600
        }
    })
}