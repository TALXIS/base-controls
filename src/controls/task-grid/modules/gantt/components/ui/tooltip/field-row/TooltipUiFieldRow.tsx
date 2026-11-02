import { ReactNode, useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITaskTooltipUiFieldRowComponents, TaskTooltipUiFieldRowComponents } from "./components";
import { getTaskTooltipUiFieldRowStyles } from "./styles";

export interface ITaskTooltipUiFieldRowProps {
    label: string;
    iconName?: string;
    /** The field's value. */
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiFieldRowComponents>;
}

/** One field: its icon, its label and its value. */
export const TaskTooltipUiFieldRow = (props: ITaskTooltipUiFieldRowProps) => {
    const components = { ...TaskTooltipUiFieldRowComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipUiFieldRowStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.fieldRow,
        children: <>
            {props.iconName && components.onRenderIcon({ iconName: props.iconName, className: styles.icon })}
            {components.onRenderLabel({ className: styles.label, children: props.label })}
            {components.onRenderValue({ className: styles.value, children: props.children })}
        </>,
    });
};
