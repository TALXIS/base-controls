import { useMemo } from "react";
import { getClassNames, IAlignment } from "@utils";
import { CELL_CONTAINER_CLASS_NAME, getCellContainerStyles } from "./styles";

export interface ICellContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Where the cell's content sits. Left, unless told otherwise. */
    alignment?: IAlignment;
}

/** The element a cell's content is drawn in. */
export const CellContainer = (props: ICellContainerProps) => {
    const { alignment = 'left', className, ...divProps } = props;
    const styles = useMemo(() => getCellContainerStyles(alignment), [alignment]);

    return <div {...divProps} className={getClassNames([CELL_CONTAINER_CLASS_NAME, styles.cellContainer, className])} />;
};
