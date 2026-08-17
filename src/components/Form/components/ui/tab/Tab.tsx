import React, { useEffect, useMemo } from "react";
import { TabContext } from "./context";
import { ILayoutBreakpoints, Layout } from "@components/Form/layout";
import { useCalculatedColumns } from "@components/Form/layout/useCalculatedColumns";
import { getTabStyles } from "./styles";

export interface ITabProps {
    id: string;
    label?: string;
    children?: React.ReactNode;
    layout?: Partial<ILayoutBreakpoints>;
    style?: React.CSSProperties;
    onColumnsPerRowChanged?: (columnsPerRow: number) => void;
}

export const Tab = (props: ITabProps) => {
    const { children, id } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const columnComponents = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    const breakpoints: Partial<ILayoutBreakpoints> = { ...{ lg: columnComponents.length }, ...props.layout };
    const styles = useMemo(() => getTabStyles(), []);
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.layout };

    const { containerStyles, columnsPerRow } = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: containerRef
    });

    useEffect(() => {
        props.onColumnsPerRowChanged?.(columnsPerRow);
    }, [columnsPerRow]);

    return <div className={styles.tab} data-id={id} ref={containerRef} style={{ ...containerStyles, ...props.style }}>
        <TabContext.Provider value={{ ...props, columnsPerRow }}>
            {children}
        </TabContext.Provider>
    </div>;
};
