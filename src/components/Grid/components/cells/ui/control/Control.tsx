import React, { useMemo } from "react";
import { getClassNames } from "@utils";
import { GridControl } from "../../../../services/cells";
import { getCellControlStyles } from "./styles";

export interface ICellControlProps extends React.HTMLAttributes<HTMLDivElement> {
    /** What the cell draws, which is what says how what it draws is laid out. */
    control: GridControl;
}

/** The room a cell's value is drawn in. */
export const Control = (props: ICellControlProps) => {
    const { control, className, ...divProps } = props;
    const alignment = control.getFieldControl()?.getColumn().alignment ?? 'left';
    const styles = useMemo(() => getCellControlStyles(alignment), [alignment]);

    return <div {...divProps} className={getClassNames([styles.control, className])} />;
};
