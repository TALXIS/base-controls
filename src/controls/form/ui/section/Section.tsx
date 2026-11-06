import { useTheme } from "@theme";
import { Text } from "@fluentui/react";
import { SectionContext } from "./context";
import { getFormUiSectionStyles } from "./styles";
import React from "react";
import { ILayoutBreakpoints, Layout } from "../layout";
import { useCalculatedColumns } from "../layout/useCalculatedColumns";

export interface IFormUiSectionProps {
    id?: string;
    showLabel?: boolean;
    showBar?: boolean;
    visible?: boolean;
    layout?: Partial<ILayoutBreakpoints>;
    labelWidth?: number;
    cellLabelCollapseBreakpoint?: number;
    cellLabelPosition?: "Top" | "Left";
    label?: string;
    children?: React.ReactNode;
}

export const FormUiSection = (props: IFormUiSectionProps) => {
    const { children, showBar = true, showLabel = true, label, id } = props;
    const isHeaderVisible = showBar && showLabel && label;

    const bodyContainerRef = React.useRef<HTMLDivElement>(null);
    const cellComponents = React.Children.toArray(children).filter(child => React.isValidElement(child));

    const breakpoints: Partial<ILayoutBreakpoints> = { ...{ lg: cellComponents.length }, ...props.layout };
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.layout };

    const { containerStyles, columnsPerRow, containerWidth } = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: bodyContainerRef
    });

    const theme = useTheme();
    const styles = getFormUiSectionStyles({ section: props, theme });

    return <div className={styles.section} data-id={id ? `section-${id}` : undefined}>
        {isHeaderVisible && (
            <div className={styles.header}>
                <Text variant="mediumPlus" className={styles.title}>
                    {label}
                </Text>
            </div>
        )}
        <div ref={bodyContainerRef} className={styles.body} style={containerStyles}>
            <SectionContext.Provider value={{ ...props, columnsPerRow, containerWidth }}>
                {children}
            </SectionContext.Provider>
        </div>
    </div>;
};
