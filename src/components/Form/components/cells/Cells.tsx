import { useMemo } from "react";
import { getCellsStyles } from "./styles";
import React from "react";

export const Cells = ({ children }: { children: React.ReactNode }) => {
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const numOfCells = childrenArray.length;
    const styles = useMemo(() => getCellsStyles({ numOfCells }), [numOfCells]);

    return <div className={styles.cells}>
        {children}
    </div>
}
