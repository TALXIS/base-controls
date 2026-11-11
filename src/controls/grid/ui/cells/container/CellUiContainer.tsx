import { useTheme } from "@theme";
import { useMemo } from "react";

import { getClassNames } from "@core";
import { CellUiContainerComponents, ICellUiContainerComponents } from "./components";
import { CELL_CONTAINER_CLASS, getCellUiContainerStyles } from "./styles";

export interface ICellUiContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    components?: Partial<ICellUiContainerComponents>;
}

/** The element a cell's content is drawn in. */
export const CellUiContainer = (props: ICellUiContainerProps) => {
    const { className, components: _, ...divProps } = props;
    const components = { ...CellUiContainerComponents, ...props.components };
    //whatever the cell was drawn in
    const theme = useTheme();
    const styles = useMemo(() => getCellUiContainerStyles(theme), [theme]);

    return components.onRender({ ...divProps, className: getClassNames([CELL_CONTAINER_CLASS, styles.cellContainer, className]) });
};
