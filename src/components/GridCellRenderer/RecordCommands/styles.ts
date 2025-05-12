import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"

export const getRecordCommandsStyles = (alignment: Required<IColumn['alignment']>) => {
    return mergeStyleSets({
        recordCommandsRoot: {

        },
        recordCommandsPrimarySet: {
            justifyContent: getJustifyContent(alignment)
        },
        recordCommandsContainer: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center'
        }   
    })
}

const getJustifyContent = (columnAlignment: Required<IColumn['alignment']>) => {
    switch(columnAlignment) {
        case 'left': {
            return 'flex-start'
        }
        case 'center': {
            return 'center'
        }
        case 'right': {
            return 'flex-end'
        }
    }
}