import React from "react";
import { useMemo } from "react";
import { useSectionContext } from "../section";
import { getCellsStyles } from "./styles";

export const Cells = ({ children }: { children: React.ReactNode }) => {
    const section = useSectionContext();
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const numOfCells = section?.columns ?? childrenArray.length;
    const styles = useMemo(
        () => getCellsStyles({ numOfCells }),
        [numOfCells],
    );

    return <div className={styles.cells}>
        {children}
    </div>
}
