import { useMemo } from "react";
import { getClassNames } from "@utils";
import { CELL_CONTAINER_CLASS_NAME, getCellContainerStyles } from "./styles";

export interface ICellContainerProps extends React.HTMLAttributes<HTMLDivElement> { }

/** The element a cell's content is drawn in. */
export const CellContainer = (props: ICellContainerProps) => {
    const { className, ...divProps } = props;
    const styles = useMemo(() => getCellContainerStyles(), []);

    return <div {...divProps} className={getClassNames([CELL_CONTAINER_CLASS_NAME, styles.cellContainer, className])} />;
};
