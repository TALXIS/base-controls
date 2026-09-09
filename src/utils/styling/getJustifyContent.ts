import { IColumn } from "@talxis/client-libraries";

/** What an alignment comes to as flex placement. */
export const getJustifyContent = (columnAlignment: Required<IColumn['alignment']>) => {
    switch (columnAlignment) {
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
