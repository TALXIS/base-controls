import React, { useMemo } from "react";
import { FormV2UiSectionBodyContext } from "./context";
import { FormV2UiSectionBodyComponents, IFormV2UiSectionBodyComponents } from "./components";
import { getFormV2UiSectionBodyStyles } from "./styles";
import { ILayoutBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";

export interface IFormV2UiSectionBodyProps {
    /** Cells per row by width; `lg` alone derives the rest. */
    layout?: Partial<ILayoutBreakpoints>;
    labelWidth?: number;
    /** Below this width a cell's label moves above its control. */
    cellLabelCollapseBreakpoint?: number;
    cellLabelPosition?: "Top" | "Left";
    /** The cells. */
    children?: React.ReactNode;
    /** Replacements for its slots. */
    components?: Partial<IFormV2UiSectionBodyComponents>;
}

/** A section's cells, laid out by the body's width. */
export const FormV2UiSectionBody = (props: IFormV2UiSectionBodyProps) => {
    const components = { ...FormV2UiSectionBodyComponents, ...props.components };
    const gridRef = React.useRef<HTMLDivElement>(null);
    const cellCount = React.Children.toArray(props.children).filter(child => React.isValidElement(child)).length;
    const breakpoints = { ...Layout.createDefaultColumnBreakpoints({ lg: cellCount, ...props.layout }), ...props.layout };
    const { containerStyles, columnsPerRow, containerWidth } = useCalculatedColumns({ breakpoints, ref: gridRef });
    const styles = useMemo(() => getFormV2UiSectionBodyStyles(), []);
    const { labelWidth, cellLabelPosition, cellLabelCollapseBreakpoint } = props;

    return components.onRender({
        ref: gridRef,
        className: styles.grid,
        style: containerStyles,
        children: <FormV2UiSectionBodyContext.Provider value={{ labelWidth, cellLabelPosition, cellLabelCollapseBreakpoint, columnsPerRow, containerWidth }}>
            {props.children}
        </FormV2UiSectionBodyContext.Provider>,
    });
};
