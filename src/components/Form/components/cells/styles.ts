import { mergeStyleSets } from "@fluentui/react";

interface ICellsStyleParams {
    collapsebreakpoint: number;
    numOfCells: number;
}

const GRID_LAYOUT_GAP = 10;

export const getCellsStyles = (params: ICellsStyleParams) => {
    const numOfColumns = Math.max(params.numOfCells, 1);
    const cellsMinWidth = `${params.collapsebreakpoint}px`;
    const totalGapWidth = `${Math.max(numOfColumns - 1, 0) * GRID_LAYOUT_GAP}px`;
    const maxColumnWidth = `calc((100% - ${totalGapWidth}) / ${numOfColumns})`;

    return mergeStyleSets({
        cells: {
            display: 'grid',
            containerType: 'inline-size',
            gap: `${GRID_LAYOUT_GAP}px`,
            gridTemplateColumns: `repeat(auto-fit, minmax(max(min(100%, ${cellsMinWidth}), ${maxColumnWidth}), 1fr))`,
        }
    })
}