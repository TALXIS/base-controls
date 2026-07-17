import { Text, useTheme } from "@fluentui/react";
import { SectionContext } from "./context";
import { getSectionStyles } from "./styles";
import React from "react";
import { ILayoutBreakpoints, Layout } from "../../layout";
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
    addedBy?: string;
    visible?: boolean;
    autoExpand?: boolean;
    /**
     * Configures how many layout columns this Section renders at each breakpoint
     * based on the width of the Section itself. This controls the responsive grid
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
    labelWidth?: number;
    cellLabelCollapseBreakpoint?: number;
    availableForPhone?: boolean;
    cellLabelAlignment?: "Center" | "Left" | "Right";
    cellLabelPosition?: "Top" | "Left";
    rowHeight?: number;
    label?: string;
    children?: React.ReactNode;
}

export const Section = (props: ISectionProps) => {
    const { children, showBar = true, showLabel = true, label, name, id } = props;
    const cells = React.Children.toArray(children).filter(child => React.isValidElement(child));
    const isHeaderVisible = showBar && showLabel && label;

    const bodyContainerRef = React.useRef<HTMLDivElement>(null);
    const cellComponents = React.Children.toArray(children).filter(child => React.isValidElement(child));

    const breakpoints: Partial<ILayoutBreakpoints> = { ...{ lg: cellComponents.length }, ...props.layout };
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.layout };

    const {containerStyles, columnsPerRow, containerWidth} = useCalculatedColumns({
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
            <SectionContext.Provider value={{...props, columnsPerRow, containerWidth }}>
                {children}
            </SectionContext.Provider>
        </div>
    </div>
}