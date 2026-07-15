import { mergeStyleSets } from "@fluentui/react";
import { useSectionContext } from "../section";

interface ICellsStyleParams {
    numOfCells: number;
}


export const getCellsStyles = (params: ICellsStyleParams) => {
    const section = useSectionContext();
    const numOfCells = section?.columns ?? params.numOfCells;

    return mergeStyleSets({
        cells: {
            display: 'grid',
            gridTemplateColumns: `repeat(${numOfCells}, 1fr)`,
            gap: 12
        }
    })
}