import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { CELL_CONTAINER_CLASS_NAME, getCellContainerStyles } from "./styles";

export interface ICellContainerProps extends React.HTMLAttributes<HTMLDivElement> { }

/** The element a cell's content is drawn in. */
export const CellContainer = (props: ICellContainerProps) => {
    const { className, ...divProps } = props;
    //whatever the cell was drawn in: the theme a cell reaches its content through is the one above this
    const theme = useTheme();
    const styles = useMemo(() => getCellContainerStyles(theme), [theme]);

    return <div {...divProps} className={getClassNames([CELL_CONTAINER_CLASS_NAME, styles.cellContainer, className])} />;
};
