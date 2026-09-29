import { useMemo } from "react";
import { CommandBarButton, concatStyleSets, IButtonProps } from "@fluentui/react";
import { getColumnHeaderContainerStyles } from "./styles";

export interface IColumnHeaderUiContainerProps extends IButtonProps { }

/** What a column header is drawn in: wrap it around the name and what stands beside it. */
export const ColumnHeaderUiContainer = (props: IColumnHeaderUiContainerProps) => {
    const styles = useMemo(() => getColumnHeaderContainerStyles(), []);

    return <CommandBarButton
        {...props}
        styles={concatStyleSets({ root: styles.containerRoot, flexContainer: styles.containerFlexContainer }, props.styles)} />;
};
