import { mergeStyleSets } from "@fluentui/react";
import { useSectionContext } from "../section";

interface ICellsStyleParams {
    numOfCells: number;
}

const GRID_LAYOUT_GAP = '10px';
const GRID_ITEM_MIN_WIDTH = '180px';


export const getCellsStyles = (params: ICellsStyleParams) => {
    const section = useSectionContext();
    const numOfCells = section?.columns ?? params.numOfCells;
    const maxColumnWidth = `calc((100% - ${(numOfCells - 1)} * ${GRID_LAYOUT_GAP}) / ${numOfCells})`;

    return mergeStyleSets({
        cells: {
            display: 'grid',
            //gridTemplateColumns: `repeat(auto-fill, minmax(max(${GRID_ITEM_MIN_WIDTH}, ${maxColumnWidth}), 1fr))`,
            gap: GRID_LAYOUT_GAP
        }
    })
}