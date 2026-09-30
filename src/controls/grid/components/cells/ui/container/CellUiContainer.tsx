import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { CellUiContainerComponents, ICellUiContainerComponents } from "./components";
import { CELL_CONTAINER_CLASS_NAME, getCellUiContainerStyles } from "./styles";

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

    return components.onRenderContainer({ ...divProps, className: getClassNames([CELL_CONTAINER_CLASS_NAME, styles.cellContainer, className]) });
};
