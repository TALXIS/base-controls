import * as React from "react";
import { ColumnsContext } from "./context";
import { getColumnsStyles } from "./styles";
import { useMemo } from "react";
import { IColumnBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";

export interface IColumnsProps {
    children?: React.ReactNode;
    breakpoints?: IColumnBreakpoints;
}

export const Columns = (props: IColumnsProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const columnComponents = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    const breakpoints: Partial<IColumnBreakpoints> = { ...{ lg: columnComponents.length }, ...props.breakpoints };
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.breakpoints };

    const { containerStyles } = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: containerRef
    });
    const styles = useMemo(() => getColumnsStyles(), []);

    return <div className={styles.columns} style={containerStyles} ref={containerRef}>
        <ColumnsContext.Provider value={true}>
            {props.children}
        </ColumnsContext.Provider>
    </div>
}
