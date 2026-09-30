import React, { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { CellUiControlComponents, ICellUiControlComponents } from "./components";
import { getCellUiControlStyles } from "./styles";

export interface ICellUiControlProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Which edge the value reads from. */
    alignment?: IAlignment;
    components?: Partial<ICellUiControlComponents>;
}

/** The room a cell's value is drawn in. */
export const CellUiControl = (props: ICellUiControlProps) => {
    const { alignment = 'left', className, components: _, ...divProps } = props;
    const components = { ...CellUiControlComponents, ...props.components };
    const styles = useMemo(() => getCellUiControlStyles(alignment), [alignment]);

    return components.onRenderContainer({ ...divProps, className: getClassNames([styles.control, className]) });
};
