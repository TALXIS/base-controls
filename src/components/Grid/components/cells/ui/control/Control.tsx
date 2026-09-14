import React, { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { getCellControlStyles } from "./styles";

export interface ICellControlProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Where what it draws sits. Left, unless told otherwise. */
    alignment?: IAlignment;
}

/**
 * What a cell draws for its value.
 *
 * A placeholder as far as the value goes: it draws whatever it is given, which today is the text the grid
 * draws through AG Grid's own `valueFormatted`. The control that belongs here - the renderer, the editor,
 * a module's own - arrives the same way.
 */
export const Control = (props: ICellControlProps) => {
    const { alignment = 'left', className, ...divProps } = props;
    const styles = useMemo(() => getCellControlStyles(alignment), [alignment]);

    return <div {...divProps} className={getClassNames([styles.control, className])} />;
};
