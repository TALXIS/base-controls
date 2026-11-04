import { useMemo } from "react";
import { concatStyleSets, IButtonProps } from "@fluentui/react";
import { ColumnHeaderUiContainerComponents, IColumnHeaderUiContainerComponents } from "./components";
import { getColumnHeaderUiContainerStyles } from "./styles";

export interface IColumnHeaderUiContainerProps extends IButtonProps {
    components?: Partial<IColumnHeaderUiContainerComponents>;
}

/** What a column header is drawn in: wrap it around the name and what stands beside it. */
export const ColumnHeaderUiContainer = (props: IColumnHeaderUiContainerProps) => {
    const { components: _, ...buttonProps } = props;
    const components = { ...ColumnHeaderUiContainerComponents, ...props.components };
    const styles = useMemo(() => getColumnHeaderUiContainerStyles(), []);

    return components.onRenderButton({
        ...buttonProps,
        styles: concatStyleSets({ root: styles.containerRoot, flexContainer: styles.containerFlexContainer }, props.styles),
    });
};
