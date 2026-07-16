import React, { useMemo } from "react";
import { TabContext } from "./context";
import { IColumnBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";
import { getTabStyles } from "./styles";

export interface ITabProps {
    id: string;
    name?: string;
    group?: string;
    verticalLayout?: boolean;
    showLabel?: boolean;
    labelId?: string;
    isUserDefined?: string;
    lockLevel?: number;
    addedBy?: string;
    expanded?: boolean;
    visible?: boolean;
    availableForPhone?: boolean;
    collapsible?: boolean;
    label?: string;
    children?: React.ReactNode;
    breakpoints?: Partial<IColumnBreakpoints>;
}

export const Tab = (props: ITabProps) => {
    const { children, id } = props;
    const containerRef = React.useRef<HTMLDivElement>(null);
    const columnComponents = React.Children.toArray(props.children).filter(child => React.isValidElement(child));
    const breakpoints: Partial<IColumnBreakpoints> = { ...{ lg: columnComponents.length }, ...props.breakpoints };
    const styles = useMemo(() => getTabStyles(), [])
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.breakpoints };

    const { containerStyles, columnsPerRow } = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: containerRef
    });

    return <div className={styles.tab} data-id={id} ref={containerRef} style={containerStyles}>
        <TabContext.Provider value={{...props, columnsPerRow }}>
            {children}
        </TabContext.Provider>
    </div>
}

