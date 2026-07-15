import { mergeStyleSets } from "@fluentui/react";


//comes from section
const DEFAULT_NUMBER_OF_COLUMNS = 1;
const DEFAULT_NUMBER_OF_ROWS = 1;

interface IRowsStylesParams {
    numOfColumns?: number;
    numOfRows?: number;
}

export const getRowsStyles = (params: IRowsStylesParams) => {
    const numOfColumns = params.numOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS;
    const numOfRows = params.numOfRows ?? DEFAULT_NUMBER_OF_ROWS;
    return mergeStyleSets({
        rows: {
            display: 'grid',
            //gridTemplateColumns: `repeat(${numOfColumns}, 1fr)`,
            gridTemplateRows: `repeat(${numOfRows}, 1fr)`,
            gap: 12
        }
    });
};
