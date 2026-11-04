import { ReactNode, useMemo } from "react";
import { ITooltipUiFieldRowsComponents, TooltipUiFieldRowsComponents } from "./components";
import { getTooltipUiFieldRowsStyles } from "./styles";

export interface ITooltipUiFieldRowsProps {
    children?: ReactNode;
    components?: Partial<ITooltipUiFieldRowsComponents>;
}

/** The field rows, one under another. */
export const TooltipUiFieldRows = (props: ITooltipUiFieldRowsProps) => {
    const components = { ...TooltipUiFieldRowsComponents, ...props.components };
    const styles = useMemo(() => getTooltipUiFieldRowsStyles(), []);

    return components.onRenderContainer({ className: styles.fieldRows, children: props.children });
};
