import React, { useMemo } from "react";
import { getClassNames } from "@utils";
import { GridFieldControl } from "../../../../services/cells";
import { getCellControlStyles } from "./styles";

export interface ICellControlProps extends React.HTMLAttributes<HTMLDivElement> {
    /** What the cell draws, which is what says how what it draws is laid out. */
    control: GridFieldControl;
}

/**
 * The room a cell's value is drawn in.
 *
 * Lays out rather than draws: what fills it is whatever it is given, and how much of the cell it takes -
 * and which edge it reads from - is the column's alignment, which the control it is handed knows.
 */
export const Control = (props: ICellControlProps) => {
    const { control, className, ...divProps } = props;
    const alignment = control.getField().getColumn().alignment ?? 'left';
    const styles = useMemo(() => getCellControlStyles(alignment), [alignment]);

    return <div {...divProps} className={getClassNames([styles.control, className])} />;
};
