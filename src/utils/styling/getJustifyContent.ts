/** Where something sits across the width it is given. */
export type IAlignment = 'left' | 'center' | 'right';

/** What an alignment comes to as flex placement. */
export const getJustifyContent = (alignment: IAlignment) => {
    switch (alignment) {
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
