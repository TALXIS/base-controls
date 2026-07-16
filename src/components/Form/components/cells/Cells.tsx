import React from "react";
import { useMemo } from "react";
import { getCellsStyles } from "./styles";
import { CellsContext } from "./context";
import { IColumnBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";


export interface ICellsProps {
    children?: React.ReactNode;
    columns?: Partial<IColumnBreakpoints>;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";

}

export const Cells = (props: ICellsProps) => {
    const { children } = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const childrenArray = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const breakpoints: Partial<IColumnBreakpoints> = { ...{ lg: childrenArray.length }, ...props.columns };
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.columns };

    const columnCalculation= useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: ref
    });

    const styles = useMemo(() => getCellsStyles({ columnCalculation }), [columnCalculation]);

    return <div className={styles.cells} ref={ref}>
        <CellsContext.Provider value={props}>
            {children}
        </CellsContext.Provider>
    </div>
}

<Cells columns={{

}} />
