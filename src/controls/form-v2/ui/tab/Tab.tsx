import React, { useMemo } from "react";
import { FormV2UiTabContext } from "./context";
import { FormV2UiTabComponents, IFormV2UiTabComponents } from "./components";
import { ILayoutBreakpoints, Layout } from "../layout";
import { useCalculatedColumns } from "../layout/useCalculatedColumns";
import { getFormV2UiTabStyles } from "./styles";

export interface IFormV2UiTabProps {
    name: string;
    /** Columns per row by width; `lg` alone derives the rest. */
    layout?: Partial<ILayoutBreakpoints>;
    /** Hides the tab with CSS; what is inside stays mounted. */
    hidden?: boolean;
    children?: React.ReactNode;
    /** Replacements for its slots. */
    components?: Partial<IFormV2UiTabComponents>;
}

/** One tab's content: its columns, laid out by the tab's width. */
export const FormV2UiTab = (props: IFormV2UiTabProps) => {
    const components = { ...FormV2UiTabComponents, ...props.components };
    const containerRef = React.useRef<HTMLDivElement>(null);
    const columnCount = React.Children.toArray(props.children).filter(child => React.isValidElement(child)).length;
    const breakpoints = { ...Layout.createDefaultColumnBreakpoints({ lg: columnCount, ...props.layout }), ...props.layout };
    const styles = useMemo(() => getFormV2UiTabStyles(!!props.hidden), [props.hidden]);
    const { containerStyles, columnsPerRow } = useCalculatedColumns({ breakpoints, ref: containerRef });

    return <FormV2UiTabContext.Provider value={{ columnsPerRow }}>
        {components.onRender({
            ref: containerRef,
            className: styles.tab,
            style: containerStyles,
            'data-id': `tab-${props.name}`,
            children: props.children,
        })}
    </FormV2UiTabContext.Provider>;
};
