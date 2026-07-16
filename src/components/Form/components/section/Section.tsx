import { Text, useTheme } from "@fluentui/react";
import { useSectionsContext } from "../sections";
import { SectionContext } from "./context";
import { getSectionStyles } from "./styles";
import { useTabContext } from "../tab";
import { useMemo } from "react";
import type { IFormSectionProps, ISection } from "../../form/FormModel";
import { useFormComponent } from "../../form/useFormComponent";

export type { IFormSectionProps } from "../../form/FormModel";

export const Section = (props: IFormSectionProps) => {
    const tab = useTabContext();
    
    const section = useFormComponent('Section', props, tab ? {
        name: 'Tab',
        instance: tab
    } : undefined) as ISection;

    const { children, showBar = true, showLabel = true, label, name, id } = section;
    const isHeaderVisible = showBar && showLabel && label;

    const theme = useTheme();
    const styles = useMemo(() => getSectionStyles(section, theme), [section.visible]);

    return <div className={styles.section} data-id={`section-${section.id}`}>
        {isHeaderVisible && (
            <div className={styles.header}>
                <Text variant="mediumPlus" className={styles.title}>
                    {label}
                </Text>
            </div>
        )}
        <div className={styles.body}>
            <SectionContext.Provider value={section}>
                {children}
            </SectionContext.Provider>
        </div>
    </div>
}
