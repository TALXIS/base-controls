import { ReactNode, useMemo } from "react";
import { IFieldListComponents, FieldListComponents } from "./components";
import { getFieldListStyles } from "./styles";

export interface IFieldListProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** Rows of labelled values, one under another. */
export const FieldList = (props: IFieldListProps) => {
    const components = { ...FieldListComponents, ...props.components };
    const styles = useMemo(() => getFieldListStyles(), []);

    return components.onRender({ className: styles.fieldList, children: props.children });
};
