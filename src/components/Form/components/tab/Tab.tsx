import React, { useEffect, useMemo } from "react";
import { TabContext } from "./context";
import { ILayoutBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";
import { getTabStyles } from "./styles";

export interface ITabProps {
    id: string;
    label?: string;
    children?: React.ReactNode;
    /**
     * Configures how many layout columns this Tab renders at each breakpoint
     * based on the width of the Tab itself. This controls the responsive grid
     * layout only, so the configured column count can be higher than the number
     * of rendered child cells/components.
     *
     * Breakpoint keys:
     * - `lg`: width above 996px
     * - `md`: width up to 996px
     * - `sm`: width up to 768px
     * - `xs`: width up to 480px
     */
    layout?: Partial<ILayoutBreakpoints>;
    style?: React.CSSProperties;
    onColumnsPerRowChanged?: (columnsPerRow: number) => void;
}

export const Tab = (props: ITabProps) => {
    const { children, id } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const columnComponents = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    const breakpoints: Partial<ILayoutBreakpoints> = { ...{ lg: columnComponents.length }, ...props.layout };
    const styles = useMemo(() => getTabStyles(), [])
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.layout };

    const { containerStyles, columnsPerRow } = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: containerRef
    });

    useEffect(() => {
        props.onColumnsPerRowChanged?.(columnsPerRow);
    }, [columnsPerRow, props.onColumnsPerRowChanged]);

    return <div className={styles.tab} data-id={id} ref={containerRef} style={{ ...containerStyles, ...props.style }}>
        <TabContext.Provider value={{...props, columnsPerRow }}>
            {children}
        </TabContext.Provider>
    </div>
}
