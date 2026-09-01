import { mergeStyleSets } from "@fluentui/react"

export const getHeaderStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
        },
        //everything left of the ribbon: the view switcher, and the gantt's zoom slider when that module
        //is registered
        headerLeftContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: 5
        },
        //the Edit Columns panel's layer, whichever variant is rendering it
        editColumnsLayerHost: {
            zIndex: 1
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