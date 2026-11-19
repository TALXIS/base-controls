import { useTheme } from "@theme";
import { ReactNode, useMemo } from "react";

import { IFieldValueComponents, FieldValueComponents } from "./components";
import { getFieldValueStyles } from "./styles";

export interface IFieldValueProps {
    label: string;
    iconName?: string;
    /** The field's value. */
    children?: ReactNode;
    components?: Partial<IFieldValueComponents>;
}

/** One field: its icon, its label and its value. */
export const FieldValue = (props: IFieldValueProps) => {
    const components = { ...FieldValueComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getFieldValueStyles(theme), [theme]);

    return components.onRender({
        className: styles.fieldValue,
        children: <>
            {props.iconName && components.onRenderIcon({ iconName: props.iconName, className: styles.icon })}
            {components.onRenderLabel({ className: styles.label, children: props.label })}
            {props.children}
        </>,
    });
};
