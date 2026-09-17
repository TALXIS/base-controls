import React, { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { GridControl } from "../../../../services/cells";
import { getCellControlStyles } from "./styles";

export interface ICellControlProps extends React.HTMLAttributes<HTMLDivElement> {
    /** What the cell draws. */
    control: GridControl;
    /** Which edge the value reads from. */
    alignment?: IAlignment;
}

/** The room a cell's value is drawn in. */
export const Control = (props: ICellControlProps) => {
    const { control, alignment = 'left', className, ...divProps } = props;
    const styles = useMemo(() => getCellControlStyles(alignment), [alignment]);

    return <div {...divProps} className={getClassNames([styles.control, className])} />;
};
