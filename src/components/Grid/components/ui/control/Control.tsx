import React, { useMemo } from "react";
import { getClassNames } from "@utils";
import { getCellControlStyles } from "./styles";

export interface ICellControlProps extends React.HTMLAttributes<HTMLDivElement> { }

/**
 * What a cell draws for its value, and the inset it is drawn in.
 *
 * A placeholder as far as the value goes: it draws whatever it is given, which today is the text the grid
 * draws through AG Grid's own `valueFormatted`. The control that belongs here - the renderer, the editor,
 * a module's own - arrives the same way and takes the same inset.
 */
export const Control = (props: ICellControlProps) => {
    const { className, ...divProps } = props;
    const styles = useMemo(() => getCellControlStyles(), []);

    return <div {...divProps} className={getClassNames([styles.control, className])} />;
};
