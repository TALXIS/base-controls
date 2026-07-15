import { mergeStyleSets } from "@fluentui/react";

export const DEFAULT_ROW_SPAN = 1;
export const DEFAULT_COL_SPAN = 1;

interface IRowStyleParams {
    numOfCells?: number;
    rowspan?: number;
    height?: string;
}


export const getRowStyles = (params: IRowStyleParams) => {
    const numOfCells = params.numOfCells ?? DEFAULT_COL_SPAN;
    const rowSpan = params.rowspan ?? DEFAULT_ROW_SPAN;
    return mergeStyleSets({
        row: {
            display: 'grid',
            gridTemplateColumns: `repeat(${numOfCells}, 1fr)`,
            gridTemplateRows: `repeat(${rowSpan}, 1fr)`,
            //height: params.height,
            //gridColumn: `span ${colSpan}`,
            //gridRow: `span ${rowSpan}`
        }
    })
}