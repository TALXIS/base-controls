import { useTheme } from "@theme";
import { ReactNode, useMemo } from "react";

import { IRecordCardFieldRowComponents, RecordCardFieldRowComponents } from "./components";
import { getRecordCardFieldRowStyles } from "./styles";

export interface IRecordCardFieldRowProps {
    label: string;
    iconName?: string;
    /** The field's value. */
    children?: ReactNode;
    components?: Partial<IRecordCardFieldRowComponents>;
}

/** One field: its icon, its label and its value. */
export const RecordCardFieldRow = (props: IRecordCardFieldRowProps) => {
    const components = { ...RecordCardFieldRowComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getRecordCardFieldRowStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.fieldRow,
        children: <>
            {props.iconName && components.onRenderIcon({ iconName: props.iconName, className: styles.icon })}
            {components.onRenderLabel({ className: styles.label, children: props.label })}
            {components.onRenderValue({ className: styles.value, children: props.children })}
        </>,
    });
};
