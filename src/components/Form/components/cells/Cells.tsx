import React from "react";
import { useMemo } from "react";
import { useSectionContext } from "../section";
import { getCellsStyles } from "./styles";
import { CELL_LABEL_DEFAULT_WIDTH, CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT } from "../cell/styles";
import { CellsContext } from "./context";

export interface ICellsProps {
    children?: React.ReactNode;
    //label width
    celllabelwidth?: number;
    //in px, at which point the label should move on top of the control, if label position is left
    collapsebreakpoint?: number;
}



export const Cells = (props: ICellsProps) => {
    const { children, celllabelwidth = CELL_LABEL_DEFAULT_WIDTH, collapsebreakpoint = CELL_DEFAULT_LABEL_COLLAPSE_BREAKPOINT } = props;
    const section = useSectionContext();
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const numOfCells = section?.columns ?? childrenArray.length;
    const styles = useMemo(() => getCellsStyles({ numOfCells, collapsebreakpoint }), [numOfCells, collapsebreakpoint]);

    return <div className={styles.cells}>
        <CellsContext.Provider value={{ celllabelwidth, collapsebreakpoint }}>
            {children}
        </CellsContext.Provider>
    </div>
}
