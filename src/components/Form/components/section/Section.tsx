import { Text, useTheme } from "@fluentui/react";
import { SectionContext } from "./context";
import { getSectionStyles } from "./styles";
import React from "react";
import { IColumnBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";

export interface ISectionProps {
    id?: string;
    name?: string;
    group?: string;
    showLabel?: boolean;
    labelId?: string;
    showBar?: boolean;
    isUserDefined?: string;
    height?: string;
    lockLevel?: number;
    layout?: string;
    addedBy?: string;
    visible?: boolean;
    autoExpand?: boolean;
    columns?: Partial<IColumnBreakpoints>;
    labelWidth?: number;
    cellLabelTopBreakpoint?: number;
    availableForPhone?: boolean;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
    label?: string;
    children?: React.ReactNode;
}

export const Section = (props: ISectionProps) => {
    const { children, showBar = true, showLabel = true, label, name, id } = props;
    const isHeaderVisible = showBar && showLabel && label;

    const bodyContainerRef = React.useRef<HTMLDivElement>(null);
    const cellComponents = React.Children.toArray(children).filter(child => React.isValidElement(child));

    const breakpoints: Partial<IColumnBreakpoints> = { ...{ lg: cellComponents.length }, ...props.columns };
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.columns };

    const {containerStyles, columnsPerRow} = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: bodyContainerRef
    });

    const theme = useTheme();
    const styles = getSectionStyles({ section: props, theme });

    return <div className={styles.section} data-id={`section-${id}`}>
        {isHeaderVisible && (
            <div className={styles.header}>
                <Text variant="mediumPlus" className={styles.title}>
                    {label}
                </Text>
            </div>
        )}
        <div ref={bodyContainerRef} className={styles.body} style={containerStyles}>
            <SectionContext.Provider value={{...props, columnsPerRow}}>
                {children}
            </SectionContext.Provider>
        </div>
    </div>
}