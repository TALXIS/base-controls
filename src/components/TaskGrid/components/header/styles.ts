import { mergeStyleSets } from "@fluentui/react"

export const getHeaderStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
        },
        ribbonQuickFindContainer: {
            flexGrow: 1,
            minWidth: 0,
            '.ms-CommandBar-primaryCommand': {
                justifyContent: 'flex-end'
            },
            '.talxis__baseControl__Ribbon': {
                minWidth: 0
            }
        }
    })
}