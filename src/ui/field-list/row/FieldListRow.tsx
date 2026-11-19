import { useTheme } from "@theme";
import { ReactNode, useMemo } from "react";

import { IFieldListRowComponents, FieldListRowComponents } from "./components";
import { getFieldListRowStyles } from "./styles";

export interface IFieldListRowProps {
    label: string;
    iconName?: string;
    /** The field's value. */
    children?: ReactNode;
    components?: Partial<IFieldListRowComponents>;
}

/** One field: its icon, its label and its value. */
export const FieldListRow = (props: IFieldListRowProps) => {
    const components = { ...FieldListRowComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getFieldListRowStyles(theme), [theme]);

    return components.onRender({
        className: styles.fieldListRow,
        children: <>
            {props.iconName && components.onRenderIcon({ iconName: props.iconName, className: styles.icon })}
            {components.onRenderLabel({ className: styles.label, children: props.label })}
            {components.onRenderValue({ className: styles.value, children: props.children })}
        </>,
    });
};
