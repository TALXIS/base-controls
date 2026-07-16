import { mergeStyleSets } from "@fluentui/react";
import { IColumnCalculation } from "../../layout/useNumberOfColumns";

const GRID_LAYOUT_GAP = 10;

interface ICellsStyleParams {
    columnCalculation: IColumnCalculation;
}

export const getCellsStyles = (params: ICellsStyleParams) => {
    const { columnCalculation } = params;
    const {value, firstRender} = columnCalculation;
    return mergeStyleSets({
        cells: {
            display: 'grid',
            opacity: firstRender ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out 0.5s',
            containerType: 'inline-size',
            gridTemplateColumns: `repeat(${value}, 1fr)`,
            gap: `${GRID_LAYOUT_GAP}px`,
        }
    })
}