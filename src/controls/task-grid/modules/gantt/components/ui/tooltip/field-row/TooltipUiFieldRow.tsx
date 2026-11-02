import { ReactNode, useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITooltipUiFieldRowComponents, TooltipUiFieldRowComponents } from "./components";
import { getTooltipUiFieldRowStyles } from "./styles";

export interface ITooltipUiFieldRowProps {
    label: string;
    iconName?: string;
    /** The field's value. */
    children?: ReactNode;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** One field: its icon, its label and its value. */
export const TooltipUiFieldRow = (props: ITooltipUiFieldRowProps) => {
    const components = { ...TooltipUiFieldRowComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTooltipUiFieldRowStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.fieldRow,
        children: <>
            {props.iconName && components.onRenderIcon({ iconName: props.iconName, className: styles.icon })}
            {components.onRenderLabel({ className: styles.label, children: props.label })}
            {components.onRenderValue({ className: styles.value, children: props.children })}
        </>,
    });
};
