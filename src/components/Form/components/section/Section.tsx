import { Text, useTheme } from "@fluentui/react";
import { SectionContext } from "./context";
import { getSectionStyles } from "./styles";
import { useTabContext } from "../tab";
import React from "react";
import { IColumnBreakpoints, Layout } from "../../layout";
import { useCalculatedColumns } from "../../layout/useCalculatedColumns";


export const Section = (props: IFormSectionProps) => {
    const tab = useTabContext();
    const section = useFormComponent('Section', props, tab ? {
        name: 'Tab',
        instance: tab
    } : undefined) as ISection;

    const { children, showBar = true, showLabel = true, label, name, id } = section;
    const isHeaderVisible = showBar && showLabel && label;

    const bodyContainerRef = React.useRef<HTMLDivElement>(null);
    const cellComponents = React.Children.toArray(children).filter(child => React.isValidElement(child));

    const breakpoints: Partial<IColumnBreakpoints> = { ...{ lg: cellComponents.length }, ...props.columns };
    const columnBreakpoints = { ...Layout.createDefaultColumnBreakpoints(breakpoints), ...props.columns };

    const columnCalculation = useCalculatedColumns({
        breakpoints: columnBreakpoints,
        ref: bodyContainerRef
    });

    const theme = useTheme();
    const styles = getSectionStyles({ section, theme, columnCalculation });

    return <div className={styles.section} data-id={`section-${section.id}`}>
        {isHeaderVisible && (
            <div className={styles.header}>
                <Text variant="mediumPlus" className={styles.title}>
                    {label}
                </Text>
            </div>
        )}
        <div ref={bodyContainerRef} className={styles.body}>
            <SectionContext.Provider value={section}>
                {children}
            </SectionContext.Provider>
        </div>
    </div>
}