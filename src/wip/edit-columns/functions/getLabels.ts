export interface ILabels {
    'column-source': string;
    'no-name': string;
    'header': string;
    'add-column': string;
    'no-results': string;
}

export const getLabels = (): ILabels => {
    return {
        'column-source': 'Column source',
        'no-name': 'No name',
        'header': 'Edit columns',
        'add-column': 'Add column',
        'no-results': 'No results found'
    }
}