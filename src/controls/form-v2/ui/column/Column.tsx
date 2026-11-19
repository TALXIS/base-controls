import * as React from "react";
import { FormV2UiColumnComponents, IFormV2UiColumnComponents } from "./components";
import { getFormV2UiColumnStyles } from "./styles";
import { Layout } from "../layout";
import { useFormV2UiTabContext } from "../tab";

export interface IFormV2UiColumnProps {
    /** How many of the tab's columns it spans. */
    colspan?: number;
    children?: React.ReactNode;
    /** Replacements for its slots. */
    components?: Partial<IFormV2UiColumnComponents>;
}

/** A column of sections inside a tab. */
export const FormV2UiColumn = (props: IFormV2UiColumnProps) => {
    const components = { ...FormV2UiColumnComponents, ...props.components };
    const { columnsPerRow = 1 } = { ...useFormV2UiTabContext() };
    const styles = React.useMemo(() => getFormV2UiColumnStyles(), []);

    return components.onRender({
        className: styles.column,
        style: Layout.getColumnStyles(props.colspan, columnsPerRow),
        children: props.children,
    });
};
